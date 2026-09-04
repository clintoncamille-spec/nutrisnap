import type { FoodItem, MacroBreakdown } from "../api/types";

const CALORIES_PER_G = { protein: 4, carbs: 4, fat: 9 };

export function sumMacros(items: FoodItem[]): MacroBreakdown {
  return items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      proteinG: totals.proteinG + item.proteinG,
      carbsG: totals.carbsG + item.carbsG,
      fatG: totals.fatG + item.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

/**
 * Scales a food item's macros proportionally when the user edits its
 * estimated portion size, assuming macros scale linearly with grams
 * (true for the AI's per-item baseline estimate).
 */
export function scaleItemToGrams(item: FoodItem, newGrams: number): FoodItem {
  if (item.estimatedGrams <= 0) return { ...item, estimatedGrams: newGrams };
  const ratio = newGrams / item.estimatedGrams;
  return {
    ...item,
    estimatedGrams: newGrams,
    calories: Math.round(item.calories * ratio),
    proteinG: round1(item.proteinG * ratio),
    carbsG: round1(item.carbsG * ratio),
    fatG: round1(item.fatG * ratio),
  };
}

export function caloriesFromMacros(macros: {
  proteinG: number;
  carbsG: number;
  fatG: number;
}): number {
  return Math.round(
    macros.proteinG * CALORIES_PER_G.protein +
      macros.carbsG * CALORIES_PER_G.carbs +
      macros.fatG * CALORIES_PER_G.fat,
  );
}

export function progressPct(consumed: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(1, consumed / goal);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
