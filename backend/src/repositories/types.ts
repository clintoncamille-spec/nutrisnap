import type { FoodItem, Recipe } from "../services/vision/types.js";

export interface MealLog {
  id: string;
  userId: string;
  photoPath: string;
  items: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  loggedAt: string;
  createdAt: string;
  scanHistoryId: string | null;
}

export interface NewMealLog {
  photoPath: string;
  items: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  loggedAt: string;
  scanHistoryId?: string | null;
}

export interface ScanHistoryEntry {
  id: string;
  userId: string;
  scanType: "meal" | "fridge";
  photoPath: string;
  rawAiResult: unknown;
  aiProvider: string;
  createdAt: string;
}

export interface NewScanHistoryEntry {
  scanType: "meal" | "fridge";
  photoPath: string;
  rawAiResult: unknown;
  aiProvider: string;
}

export interface FavoriteRecipe {
  id: string;
  userId: string;
  sourceScanId: string | null;
  recipe: Recipe;
  createdAt: string;
}

export interface Profile {
  displayName: string | null;
  dailyCalorieGoal: number;
  dailyProteinGoalG: number;
  dailyCarbsGoalG: number;
  dailyFatGoalG: number;
}

export interface MealLogRepository {
  create(userId: string, log: NewMealLog): Promise<MealLog>;
  listByUser(
    userId: string,
    opts: { limit?: number; before?: string; cursor?: string },
  ): Promise<{ items: MealLog[]; nextCursor: string | null }>;
  getById(userId: string, id: string): Promise<MealLog | null>;
  listForDate(userId: string, isoDate: string): Promise<MealLog[]>;
}

export interface ScanHistoryRepository {
  create(userId: string, scan: NewScanHistoryEntry): Promise<ScanHistoryEntry>;
  getById(userId: string, id: string): Promise<ScanHistoryEntry | null>;
  listByUser(
    userId: string,
    opts: { type?: "meal" | "fridge"; limit?: number },
  ): Promise<ScanHistoryEntry[]>;
}

export interface RecipeRepository {
  saveFavorite(
    userId: string,
    recipe: Recipe,
    sourceScanId?: string,
  ): Promise<FavoriteRecipe>;
  removeFavorite(userId: string, id: string): Promise<void>;
  listFavorites(userId: string): Promise<FavoriteRecipe[]>;
}

export interface ProfileRepository {
  get(userId: string): Promise<Profile>;
  update(userId: string, patch: Partial<Profile>): Promise<Profile>;
}
