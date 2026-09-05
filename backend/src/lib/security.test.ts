import { describe, expect, it } from "vitest";
import {
  calculateMealTotals,
  isUserOwnedPath,
  validateCorsOrigin,
} from "./security.js";

const userId = "user-123";

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

describe("backend security helpers", () => {
  it("accepts only paths rooted in the authenticated user's directory", () => {
    expect(isUserOwnedPath(userId, `${userId}/photo.jpg`)).toBe(true);
    expect(isUserOwnedPath(userId, "other-user/photo.jpg")).toBe(false);
    expect(isUserOwnedPath(userId, `${userId}-suffix/photo.jpg`)).toBe(false);
    expect(isUserOwnedPath(userId, `${userId}/../other-user/photo.jpg`)).toBe(false);
  });

  it("recomputes meal totals from food items", () => {
    expect(calculateMealTotals(items)).toEqual({
      calories: 405,
      proteinG: 11.3,
      carbsG: 77,
      fatG: 6.4,
    });
  });

  it("rejects wildcard CORS in production", () => {
    expect(() => validateCorsOrigin("production", "*")).toThrow(
      "CORS_ORIGIN must be explicit in production",
    );
    expect(() => validateCorsOrigin("production", "https://app.example.com")).not.toThrow();
    expect(() => validateCorsOrigin("development", "*")).not.toThrow();
  });
});
