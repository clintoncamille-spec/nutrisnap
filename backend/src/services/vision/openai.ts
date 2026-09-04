import OpenAI from "openai";
import { env } from "../../config/env.js";
import { verifyTotals } from "../../lib/macros.js";
import {
  fridgeAnalysisSchema,
  mealAnalysisSchema,
  recipesSchema,
  toJsonSchema,
} from "./schemas.js";
import type {
  FridgeAnalysis,
  Ingredient,
  ImageRef,
  MealAnalysis,
  Recipe,
  RecipeGenerator,
  VisionProvider,
} from "./types.js";
import { VisionProviderError } from "./types.js";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const MEAL_ANALYSIS_SYSTEM_PROMPT = `You are a nutrition estimation assistant. You will be shown a photo of a
prepared meal. First decide whether this is actually a photo of a plated
meal or food; if not, set isValidMealPhoto to false and return empty
items/totals. Otherwise, identify each distinct food item visible (treat
sauces/garnishes as separate items only if calorically significant,
otherwise fold into the main item and note it in the item name). For each
item estimate:
- name (concise, e.g. "grilled chicken breast", not "meat")
- confidence (0-1, your honest visual certainty)
- estimatedGrams (portion size — use plate/utensil/hand scale as a size
  reference if visible; assume a standard restaurant portion if no scale
  reference is visible)
- calories, proteinG, carbsG, fatG for that estimated portion, using
  standard USDA nutrition values for that food type.
If the plate contains an item you cannot confidently identify, include it
with a low confidence score and name it as specifically as you can rather
than omitting it. Recompute the totals as the sum of all items — double
check totalCalories/totalProteinG/totalCarbsG/totalFatG equal those sums.
Use the warnings array for anything the user should know (e.g. "low
confidence on 'sauce'").

Example: a plate with visible grilled chicken breast and steamed broccoli,
with a fork for scale, might reasonably estimate ~150g chicken breast
(~248 kcal, 46g protein, 0g carbs, 5g fat) and ~90g broccoli (~31 kcal,
2.5g protein, 6g carbs, 0.3g fat).`;

const FRIDGE_ANALYSIS_SYSTEM_PROMPT = `You are an ingredient identification assistant. You will be shown a photo
of raw ingredients (e.g. inside a fridge or on a counter). First decide
whether this is actually a photo showing food ingredients; if not, set
isValidFridgePhoto to false and return an empty ingredients list.
Otherwise, list every distinct visible ingredient. Ignore any bottle/box
branded product you cannot confidently identify as a specific food
ingredient. Lean toward broad, generic ingredient names (e.g. "bell
pepper", not "red bell pepper, slightly bruised") since precision matters
less here than recall — catching all visible ingredients matters more
than exact identification. For estimatedQuantity give a short free-text
guess (e.g. "6-8 visible", "1 bag", "~1 cup"), or an empty string if you
can't estimate one.`;

function recipeGenerationPrompt(ingredients: Ingredient[], count: number) {
  const list = ingredients.map((i) => i.name).join(", ");
  return `Given this list of identified ingredients: ${list}, and assuming the
cook has basic pantry staples (cooking oil, salt, pepper, and optionally
garlic, onion, basic dried herbs — state explicitly in pantryStaplesUsed
which of these you used), generate exactly ${count} distinct, healthy,
easy recipes (each under 45 minutes total time, minimal specialized
equipment) that primarily use the provided ingredients. Do not invent an
ingredient in ingredientsUsed with fromPhoto: true unless it appears in
the provided ingredient list — pantry staples should have fromPhoto:
false. Provide prep/cook time, step-by-step instructions written for a
home cook, and estimated nutrition per serving.`;
}

async function structuredChatCall<T>(params: {
  systemPrompt: string;
  userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[];
  schemaName: string;
  schema: import("zod").ZodTypeAny;
  parse: (raw: unknown) => T;
}): Promise<T> {
  const jsonSchema = toJsonSchema(params.schema, params.schemaName);
  let completion;
  try {
    completion = await client.chat.completions.create({
      model: env.OPENAI_VISION_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: params.schemaName,
          schema: jsonSchema,
          strict: true,
        },
      },
    });
  } catch (err) {
    throw new VisionProviderError(
      "ai_provider_error",
      `OpenAI request failed: ${(err as Error).message}`,
    );
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new VisionProviderError(
      "ai_provider_error",
      "OpenAI returned an empty response",
    );
  }

  try {
    return params.parse(JSON.parse(raw));
  } catch (err) {
    throw new VisionProviderError(
      "ai_provider_error",
      `Failed to parse/validate OpenAI structured output: ${(err as Error).message}`,
    );
  }
}

function imageContentPart(
  image: ImageRef,
  detail: "low" | "high",
): OpenAI.Chat.Completions.ChatCompletionContentPart {
  return {
    type: "image_url",
    image_url: { url: image.url, detail },
  };
}

class OpenAiVisionProvider implements VisionProvider {
  async analyzeMeal(image: ImageRef): Promise<MealAnalysis> {
    const result = await structuredChatCall({
      systemPrompt: MEAL_ANALYSIS_SYSTEM_PROMPT,
      userContent: [imageContentPart(image, "high")],
      schemaName: "meal_analysis",
      schema: mealAnalysisSchema,
      parse: (raw) => mealAnalysisSchema.parse(raw),
    });

    if (!result.isValidMealPhoto || result.items.length === 0) {
      throw new VisionProviderError(
        "no_food_detected",
        "Could not identify a meal in this photo.",
      );
    }

    // Recompute totals server-side (defense in depth) rather than trusting
    // the model's stated totals.
    return { ...result, ...verifyTotals(result.items) };
  }

  async analyzeFridge(image: ImageRef): Promise<FridgeAnalysis> {
    const result = await structuredChatCall({
      systemPrompt: FRIDGE_ANALYSIS_SYSTEM_PROMPT,
      userContent: [imageContentPart(image, "low")],
      schemaName: "fridge_analysis",
      schema: fridgeAnalysisSchema,
      parse: (raw) => fridgeAnalysisSchema.parse(raw),
    });

    if (!result.isValidFridgePhoto || result.ingredients.length === 0) {
      throw new VisionProviderError(
        "no_food_detected",
        "Could not identify ingredients in this photo.",
      );
    }

    return result;
  }
}

class OpenAiRecipeGenerator implements RecipeGenerator {
  async generateRecipes(
    ingredients: Ingredient[],
    opts: { count?: number } = {},
  ): Promise<Recipe[]> {
    const count = opts.count ?? 3;
    const validNames = new Set(ingredients.map((i) => i.name.toLowerCase()));

    const generate = async () =>
      structuredChatCall({
        systemPrompt:
          "You are a home-cooking recipe assistant that writes healthy, easy recipes strictly from a given ingredient list plus basic pantry staples.",
        userContent: [
          { type: "text", text: recipeGenerationPrompt(ingredients, count) },
        ],
        schemaName: "recipes",
        schema: recipesSchema,
        parse: (raw) => recipesSchema.parse(raw),
      });

    let result = await generate();

    const hallucinated = result.recipes.some((r) =>
      r.ingredientsUsed.some(
        (u) => u.fromPhoto && !validNames.has(u.name.toLowerCase()),
      ),
    );
    if (hallucinated) {
      // One bounded retry — the most common failure mode for this call is
      // the model inventing an ingredient not present in the photo.
      result = await generate();
    }

    return result.recipes;
  }
}

export const openAiVisionProvider = new OpenAiVisionProvider();
export const openAiRecipeGenerator = new OpenAiRecipeGenerator();
