import type { FoodItem } from "../services/vision/types.js";

export function verifyTotals(items: FoodItem[]) {
  return items.reduce(
    (acc, item) => ({
      totalCalories: acc.totalCalories + item.calories,
      totalProteinG: acc.totalProteinG + item.proteinG,
      totalCarbsG: acc.totalCarbsG + item.carbsG,
      totalFatG: acc.totalFatG + item.fatG,
    }),
    { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 },
  );
}
