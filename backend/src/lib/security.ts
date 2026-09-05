import type { FoodItem } from "../services/vision/types.js";

export function isUserOwnedPath(userId: string, path: string): boolean {
  const segments = path.split("/");
  return segments.length > 1 && segments[0] === userId && !segments.includes("..");
}

export function calculateMealTotals(items: FoodItem[]) {
  return items.reduce(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      proteinG: sum.proteinG + item.proteinG,
      carbsG: sum.carbsG + item.carbsG,
      fatG: sum.fatG + item.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

export function validateCorsOrigin(
  nodeEnv: "development" | "production" | "test",
  corsOrigin: string,
): void {
  if (nodeEnv === "production" && corsOrigin === "*") {
    throw new Error("CORS_ORIGIN must be explicit in production");
  }
}
