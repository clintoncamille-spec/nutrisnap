import { env } from "../../config/env.js";
import { openAiRecipeGenerator, openAiVisionProvider } from "./openai.js";
import type { RecipeGenerator, VisionProvider } from "./types.js";

function selectVisionProvider(): VisionProvider {
  switch (env.VISION_PROVIDER) {
    case "openai":
      return openAiVisionProvider;
    case "gemini":
      throw new Error(
        "VISION_PROVIDER=gemini is documented but not implemented yet — see ./gemini.ts",
      );
    default:
      return openAiVisionProvider;
  }
}

function selectRecipeGenerator(): RecipeGenerator {
  return openAiRecipeGenerator;
}

// The only exports anything outside services/vision/** should import.
export const visionProvider: VisionProvider = selectVisionProvider();
export const recipeGenerator: RecipeGenerator = selectRecipeGenerator();
export * from "./types.js";
