import { useQuery } from "@tanstack/react-query";
import type { NutriSnapApiClient } from "../api/client";
import { progressPct } from "../lib/macroMath";

export function useDailySummary(api: NutriSnapApiClient, date?: string) {
  const query = useQuery({
    queryKey: ["dailySummary", date ?? "today"],
    queryFn: () => api.getDailySummary(date),
  });

  const progress = query.data
    ? {
        calories: progressPct(
          query.data.caloriesConsumed,
          query.data.caloriesGoal,
        ),
        protein: progressPct(query.data.proteinG, query.data.proteinGoalG),
        carbs: progressPct(query.data.carbsG, query.data.carbsGoalG),
        fat: progressPct(query.data.fatG, query.data.fatGoalG),
      }
    : null;

  return { ...query, progress };
}
