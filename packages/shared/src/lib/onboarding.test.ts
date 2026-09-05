import { describe, expect, it } from "vitest";
import { calcOnboardingTargets } from "./onboarding";

describe("calcOnboardingTargets", () => {
  it("computes a deficit plan for a lose-weight goal", () => {
    const targets = calcOnboardingTargets({
      age: 32,
      weightKg: 70,
      heightCm: 175,
      activityLevel: "moderate",
      goal: "lose",
    });
    expect(targets).toEqual({
      dailyCalorieGoal: 1911,
      dailyProteinGoalG: 167,
      dailyCarbsGoalG: 167,
      dailyFatGoalG: 64,
    });
  });

  it("computes a surplus plan for a build-muscle goal", () => {
    const targets = calcOnboardingTargets({
      age: 28,
      weightKg: 82,
      heightCm: 180,
      activityLevel: "active",
      goal: "build",
    });
    expect(targets).toEqual({
      dailyCalorieGoal: 3279,
      dailyProteinGoalG: 246,
      dailyCarbsGoalG: 369,
      dailyFatGoalG: 91,
    });
  });

  it("computes a maintenance plan at sedentary activity", () => {
    const targets = calcOnboardingTargets({
      age: 45,
      weightKg: 60,
      heightCm: 162,
      activityLevel: "sedentary",
      goal: "maintain",
    });
    expect(targets).toEqual({
      dailyCalorieGoal: 1571,
      dailyProteinGoalG: 118,
      dailyCarbsGoalG: 157,
      dailyFatGoalG: 52,
    });
  });

  it("never returns a calorie target below the 1200 floor", () => {
    const targets = calcOnboardingTargets({
      age: 70,
      weightKg: 40,
      heightCm: 145,
      activityLevel: "sedentary",
      goal: "lose",
    });
    expect(targets.dailyCalorieGoal).toBe(1200);
  });
});
