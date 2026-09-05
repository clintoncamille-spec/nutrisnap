import { describe, expect, it } from "vitest";
import { verifyTotals } from "./macros.js";

describe("verifyTotals", () => {
  it("recomputes totals as the sum of each food item's macros", () => {
    const items = [
      {
        name: "Oats",
        confidence: 0.9,
        estimatedGrams: 80,
        calories: 300,
        proteinG: 10,
        carbsG: 50,
        fatG: 6,
      },
      {
        name: "Banana",
        confidence: 0.95,
        estimatedGrams: 120,
        calories: 105,
        proteinG: 1.3,
        carbsG: 27,
        fatG: 0.4,
      },
    ];

    expect(verifyTotals(items)).toEqual({
      totalCalories: 405,
      totalProteinG: 11.3,
      totalCarbsG: 77,
      totalFatG: 6.4,
    });
  });

  it("returns zeroed totals for an empty item list", () => {
    expect(verifyTotals([])).toEqual({
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0,
    });
  });
});
