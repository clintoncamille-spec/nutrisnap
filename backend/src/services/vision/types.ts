export interface FoodItem {
  name: string;
  confidence: number;
  estimatedGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealAnalysis {
  isValidMealPhoto: boolean;
  items: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  warnings: string[];
}

export interface Ingredient {
  name: string;
  confidence: number;
  estimatedQuantity?: string;
}

export interface FridgeAnalysis {
  isValidFridgePhoto: boolean;
  ingredients: Ingredient[];
}

export interface RecipeIngredientUse {
  name: string;
  quantity: string;
  fromPhoto: boolean;
}

export interface Recipe {
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredientsUsed: RecipeIngredientUse[];
  pantryStaplesUsed: string[];
  steps: string[];
  nutritionPerServing: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
}

/** A reference to an already-uploaded image (see storage service) — provider
 * implementations decide how to turn this into whatever their API needs
 * (OpenAI takes the URL directly; a Gemini implementation would fetch bytes
 * server-side and inline/upload them instead). */
export interface ImageRef {
  url: string;
  mimeType: string;
}

export interface VisionProvider {
  analyzeMeal(image: ImageRef): Promise<MealAnalysis>;
  analyzeFridge(image: ImageRef): Promise<FridgeAnalysis>;
}

export interface RecipeGenerator {
  generateRecipes(
    ingredients: Ingredient[],
    opts?: { count?: number },
  ): Promise<Recipe[]>;
}

export class VisionProviderError extends Error {
  constructor(
    public code: "no_food_detected" | "ai_provider_error",
    message: string,
  ) {
    super(message);
    this.name = "VisionProviderError";
  }
}
