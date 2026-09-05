import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NutriSnapApiClient, UploadFile } from "../api/client";
import type {
  FridgeAnalysisResult,
  MealAnalysisResult,
  MealLogInput,
} from "../api/types";

/**
 * Uploads a captured photo then analyzes it, per the backend's two-step
 * upload-then-analyze contract (see project plan §Image handling).
 */
export function useAnalyzeMeal(api: NutriSnapApiClient) {
  return useMutation<MealAnalysisResult, Error, UploadFile>({
    mutationFn: async (file) => {
      const { photoPath } = await api.uploadPhoto(file);
      try {
        return await api.analyzeMeal(photoPath);
      } catch (error) {
        await api.deletePhoto(photoPath).catch(() => undefined);
        throw error;
      }
    },
  });
}

export function useAnalyzeFridge(api: NutriSnapApiClient) {
  return useMutation<FridgeAnalysisResult, Error, UploadFile>({
    mutationFn: async (file) => {
      const { photoPath } = await api.uploadPhoto(file);
      try {
        return await api.analyzeFridge(photoPath);
      } catch (error) {
        await api.deletePhoto(photoPath).catch(() => undefined);
        throw error;
      }
    },
  });
}

export function useSaveMealLog(api: NutriSnapApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: MealLogInput) => api.createMealLog(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useSaveFavoriteRecipe(api: NutriSnapApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipe,
      sourceScanId,
    }: {
      recipe: Parameters<NutriSnapApiClient["saveFavoriteRecipe"]>[0];
      sourceScanId?: string;
    }) => api.saveFavoriteRecipe(recipe, sourceScanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteRecipes"] });
    },
  });
}
