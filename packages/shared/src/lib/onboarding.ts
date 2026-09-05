export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type FitnessGoal = "lose" | "maintain" | "build";

export interface ActivityLevelOption {
  id: ActivityLevel;
  label: string;
  sub: string;
}

export interface FitnessGoalOption {
  id: FitnessGoal;
  label: string;
  sub: string;
}

export const ACTIVITY_LEVEL_OPTIONS: ActivityLevelOption[] = [
  { id: "sedentary", label: "Sedentary", sub: "Little to no exercise, desk job" },
  { id: "light", label: "Lightly active", sub: "Light exercise 1–3 days a week" },
  { id: "moderate", label: "Moderately active", sub: "Moderate exercise 3–5 days a week" },
  { id: "active", label: "Very active", sub: "Hard exercise 6–7 days a week" },
  { id: "athlete", label: "Athlete", sub: "Intense daily training or physical job" },
];

export const FITNESS_GOAL_OPTIONS: FitnessGoalOption[] = [
  { id: "lose", label: "Lose weight", sub: "A steady deficit that preserves muscle" },
  { id: "maintain", label: "Maintain", sub: "Hold steady at your current weight" },
  { id: "build", label: "Build muscle", sub: "A lean surplus to support training" },
];

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_CALORIE_ADJUSTMENTS: Record<FitnessGoal, number> = {
  lose: -500,
  maintain: 0,
  build: 300,
};

const GOAL_MACRO_SPLITS: Record<FitnessGoal, { protein: number; carbs: number; fat: number }> = {
  lose: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  build: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

export interface OnboardingInput {
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}

export interface OnboardingTargets {
  dailyCalorieGoal: number;
  dailyProteinGoalG: number;
  dailyCarbsGoalG: number;
  dailyFatGoalG: number;
}

/**
 * Mifflin-St Jeor BMR, averaged across the male/female constant (+5 / -161)
 * since onboarding doesn't collect biological sex — a reasonable unisex
 * approximation rather than an additional required field.
 */
export function calcOnboardingTargets(input: OnboardingInput): OnboardingTargets {
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 78;
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const dailyCalorieGoal = Math.max(
    1200,
    Math.round(tdee + GOAL_CALORIE_ADJUSTMENTS[input.goal]),
  );
  const split = GOAL_MACRO_SPLITS[input.goal];
  return {
    dailyCalorieGoal,
    dailyProteinGoalG: Math.round((dailyCalorieGoal * split.protein) / 4),
    dailyCarbsGoalG: Math.round((dailyCalorieGoal * split.carbs) / 4),
    dailyFatGoalG: Math.round((dailyCalorieGoal * split.fat) / 9),
  };
}
