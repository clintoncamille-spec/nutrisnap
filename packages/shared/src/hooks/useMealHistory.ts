import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { NutriSnapApiClient } from "../api/client";

export function useMealHistory(
  api: NutriSnapApiClient,
  params: { from?: string; to?: string } = {},
) {
  return useInfiniteQuery({
    queryKey: ["mealLogs", params],
    queryFn: ({ pageParam }) =>
      api.listMealLogs({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useFavoriteRecipes(api: NutriSnapApiClient) {
  return useQuery({
    queryKey: ["favoriteRecipes"],
    queryFn: () => api.listFavoriteRecipes(),
  });
}

export function useScanHistory(
  api: NutriSnapApiClient,
  type?: "meal" | "fridge",
) {
  return useQuery({
    queryKey: ["scanHistory", type],
    queryFn: () => api.listScans({ type }),
  });
}
