// Domain types shared between the backend contract and both frontends.
// These mirror backend/src/services/vision/types.ts by convention (kept
// in sync by hand for now — see backend plan for the single-source-of-truth
// zod schemas that generate the backend-side equivalents).

export interface FoodItem {
  id: string;
  name: string;
  confidence: number; // 0-1
  estimatedGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MacroBreakdown {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealAnalysisResult {
  scanId: string;
  photoPath: string;
  photoSignedUrl: string;
  items: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  warnings?: string[];
}

export interface Ingredient {
  name: string;
  confidence: number;
  estimatedQuantity?: string;
}

export interface RecipeIngredientUse {
  name: string;
  quantity: string;
  fromPhoto: boolean;
}

export interface Recipe {
  id?: string;
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredientsUsed: RecipeIngredientUse[];
  pantryStaplesUsed: string[];
  steps: string[];
  nutritionPerServing: MacroBreakdown;
}

export interface FridgeAnalysisResult {
  scanId: string;
  photoPath: string;
  photoSignedUrl: string;
  ingredientsDetected: Ingredient[];
  recipes: Recipe[];
}

export interface MealLog {
  id: string;
  photoPath: string;
  photoSignedUrl?: string;
  items: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  loggedAt: string; // ISO timestamp
  createdAt: string;
  scanHistoryId?: string;
}

export interface MealLogInput {
  scanId: string;
  photoPath: string;
  items: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  loggedAt: string;
}

export interface FavoriteRecipe {
  id: string;
  recipe: Recipe;
  sourceScanId?: string;
  createdAt: string;
}

export interface ScanHistoryEntry {
  id: string;
  scanType: "meal" | "fridge";
  photoPath: string;
  photoSignedUrl?: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}

export interface DailySummary {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinG: number;
  proteinGoalG: number;
  carbsG: number;
  carbsGoalG: number;
  fatG: number;
  fatGoalG: number;
}

export interface Profile {
  displayName: string | null;
  dailyCalorieGoal: number;
  dailyProteinGoalG: number;
  dailyCarbsGoalG: number;
  dailyFatGoalG: number;
}

export type ApiErrorCode =
  | "no_food_detected"
  | "rate_limited"
  | "ai_provider_error"
  | "invalid_image"
  | "invalid_request"
  | "not_found"
  | "unauthorized";

export class ApiError extends Error {
  code: ApiErrorCode | "unknown";
  status: number;

  constructor(code: ApiErrorCode | "unknown", message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
