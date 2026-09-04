import { env } from "../config/env.js";
import { mealLogRepository as supabaseMealLogRepository } from "./supabase/mealLogRepository.js";
import { profileRepository as supabaseProfileRepository } from "./supabase/profileRepository.js";
import { recipeRepository as supabaseRecipeRepository } from "./supabase/recipeRepository.js";
import { scanHistoryRepository as supabaseScanHistoryRepository } from "./supabase/scanHistoryRepository.js";
import type {
  MealLogRepository,
  ProfileRepository,
  RecipeRepository,
  ScanHistoryRepository,
} from "./types.js";

function assertSupabase(): void {
  if (env.DB_PROVIDER !== "supabase") {
    throw new Error(
      `DB_PROVIDER=${env.DB_PROVIDER} is documented but not implemented — only "supabase" is built. See repositories/README notes in the project plan.`,
    );
  }
}
assertSupabase();

// The only exports anything outside repositories/** should import.
export const mealLogRepository: MealLogRepository = supabaseMealLogRepository;
export const scanHistoryRepository: ScanHistoryRepository =
  supabaseScanHistoryRepository;
export const recipeRepository: RecipeRepository = supabaseRecipeRepository;
export const profileRepository: ProfileRepository = supabaseProfileRepository;
export * from "./types.js";
