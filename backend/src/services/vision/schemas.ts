import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const foodItemSchema = z
  .object({
    name: z.string(),
    confidence: z.number().min(0).max(1),
    estimatedGrams: z.number().positive(),
    calories: z.number().nonnegative(),
    proteinG: z.number().nonnegative(),
    carbsG: z.number().nonnegative(),
    fatG: z.number().nonnegative(),
  })
  .strict();

export const mealAnalysisSchema = z
  .object({
    isValidMealPhoto: z.boolean(),
    items: z.array(foodItemSchema),
    totalCalories: z.number().nonnegative(),
    totalProteinG: z.number().nonnegative(),
    totalCarbsG: z.number().nonnegative(),
    totalFatG: z.number().nonnegative(),
    warnings: z.array(z.string()),
  })
  .strict();

const ingredientSchema = z
  .object({
    name: z.string(),
    confidence: z.number().min(0).max(1),
    estimatedQuantity: z.string(),
  })
  .strict();

export const fridgeAnalysisSchema = z
  .object({
    isValidFridgePhoto: z.boolean(),
    ingredients: z.array(ingredientSchema),
  })
  .strict();

const recipeIngredientUseSchema = z
  .object({
    name: z.string(),
    quantity: z.string(),
    fromPhoto: z.boolean(),
  })
  .strict();

const recipeSchema = z
  .object({
    title: z.string(),
    prepTimeMinutes: z.number().nonnegative(),
    cookTimeMinutes: z.number().nonnegative(),
    servings: z.number().positive(),
    ingredientsUsed: z.array(recipeIngredientUseSchema),
    pantryStaplesUsed: z.array(z.string()),
    steps: z.array(z.string()),
    nutritionPerServing: z
      .object({
        calories: z.number().nonnegative(),
        proteinG: z.number().nonnegative(),
        carbsG: z.number().nonnegative(),
        fatG: z.number().nonnegative(),
      })
      .strict(),
  })
  .strict();

export const recipesSchema = z
  .object({
    recipes: z.array(recipeSchema),
  })
  .strict();

export function toJsonSchema(schema: z.ZodTypeAny, name: string) {
  return zodToJsonSchema(schema, {
    name,
    $refStrategy: "none",
    target: "jsonSchema7",
  });
}
