import { describe, expect, it } from "vitest";
import { answerFreeText, answerQuickPrompt, buildDailyBrief } from "./coach";
import type { DailySummary } from "../api/types";

function summary(overrides: Partial<DailySummary> = {}): DailySummary {
  return {
    caloriesConsumed: 0,
    caloriesGoal: 2000,
    proteinG: 0,
    proteinGoalG: 150,
    carbsG: 0,
    carbsGoalG: 200,
    fatG: 0,
    fatGoalG: 65,
    ...overrides,
  };
}

describe("buildDailyBrief", () => {
  it("acknowledges nothing logged yet", () => {
    expect(buildDailyBrief(summary())).toMatch(/nothing logged yet/i);
  });

  it("flags being over the calorie target", () => {
    const brief = buildDailyBrief(summary({ caloriesConsumed: 2200, proteinG: 100 }));
    expect(brief).toMatch(/over your 2,?000 target/i);
  });

  it("gives an encouraging summary for a balanced day", () => {
    const brief = buildDailyBrief(
      summary({ caloriesConsumed: 1200, proteinG: 100 }),
    );
    expect(brief).toMatch(/solid day so far/i);
  });
});

describe("answerQuickPrompt", () => {
  it("explains the day's targets", () => {
    const reply = answerQuickPrompt("macros", summary());
    expect(reply).toContain("2000 kcal");
    expect(reply).toContain("150g protein");
  });

  it("falls back gracefully for an unknown prompt id", () => {
    expect(answerQuickPrompt("unknown", summary())).toMatch(/not sure/i);
  });
});

describe("answerFreeText", () => {
  it("answers a protein-specific question using live numbers", () => {
    const reply = answerFreeText("how's my protein looking?", summary({ proteinG: 80 }));
    expect(reply).toContain("80g");
    expect(reply).toContain("150g");
  });

  it("gives a generic but data-grounded fallback for anything else", () => {
    const reply = answerFreeText("what should I eat for dinner", summary({ caloriesConsumed: 900 }));
    expect(reply).toContain("900");
  });
});
