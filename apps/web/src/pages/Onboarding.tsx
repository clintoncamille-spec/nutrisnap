import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  Activity,
  Armchair,
  Bike,
  Equal,
  Flame,
  Footprints,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ACTIVITY_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  calcOnboardingTargets,
  useUpdateProfile,
  type ActivityLevel,
  type FitnessGoal,
} from "@nutrisnap/shared";
import { colors } from "../../../../packages/config/design-tokens.mjs";
import { apiClient } from "../lib/apiClient";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

const ACTIVITY_ICONS: Record<ActivityLevel, ComponentType<{ size?: number }>> = {
  sedentary: Armchair,
  light: Footprints,
  moderate: Bike,
  active: Activity,
  athlete: Flame,
};

const GOAL_ICONS: Record<FitnessGoal, ComponentType<{ size?: number }>> = {
  lose: TrendingDown,
  maintain: Equal,
  build: TrendingUp,
};

const STEPS = ["basics", "body", "activity", "goal", "review"] as const;
type Step = (typeof STEPS)[number];

const DRAFT_KEY = "ns-onboarding-draft";

interface OnboardingDraft {
  step: Step;
  name: string;
  age: string;
  unit: "metric" | "imperial";
  weightKg: number;
  heightCm: number;
  weightText: string;
  heightText: string;
  activityLevel: ActivityLevel | "";
  goal: FitnessGoal | "";
}

function loadDraft(): OnboardingDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
}
function saveDraft(draft: OnboardingDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore — private-mode/storage-disabled browsers just won't get draft recovery
  }
}
function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

const inputClass =
  "rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

function OptionRow({
  selected,
  onClick,
  Icon,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  Icon: ComponentType<{ size?: number }>;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
        selected
          ? "border-primary-500 bg-primary-50"
          : "border-neutral-200 bg-white hover:bg-neutral-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
          selected ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-600"
        }`}
      >
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-sm font-medium text-neutral-900">{label}</span>
        <span className="block text-xs text-neutral-500">{sub}</span>
      </span>
    </button>
  );
}

export function Onboarding({ onSaved }: { onSaved?: () => void } = {}) {
  const updateProfile = useUpdateProfile(apiClient);
  const draft = useState(() => loadDraft())[0];

  const [step, setStep] = useState<Step>(draft?.step ?? "basics");
  const [name, setName] = useState(draft?.name ?? "");
  const [age, setAge] = useState(draft?.age ?? "");
  const [unit, setUnit] = useState<"metric" | "imperial">(draft?.unit ?? "metric");
  const [weightKg, setWeightKg] = useState(draft?.weightKg ?? 70);
  const [heightCm, setHeightCm] = useState(draft?.heightCm ?? 170);
  const [weightText, setWeightText] = useState(draft?.weightText ?? "70");
  const [heightText, setHeightText] = useState(draft?.heightText ?? "170");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">(draft?.activityLevel ?? "");
  const [goal, setGoal] = useState<FitnessGoal | "">(draft?.goal ?? "");

  useEffect(() => {
    saveDraft({ step, name, age, unit, weightKg, heightCm, weightText, heightText, activityLevel, goal });
  }, [step, name, age, unit, weightKg, heightCm, weightText, heightText, activityLevel, goal]);

  const stepIndex = STEPS.indexOf(step);
  const ageNum = parseInt(age, 10);

  const canContinue: Record<Step, boolean> = {
    basics: name.trim().length > 0 && ageNum >= 10 && ageNum <= 100,
    body: weightKg >= 30 && weightKg <= 300 && heightCm >= 100 && heightCm <= 230,
    activity: !!activityLevel,
    goal: !!goal,
    review: true,
  };

  const targets =
    activityLevel && goal
      ? calcOnboardingTargets({ age: ageNum, weightKg, heightCm, activityLevel, goal })
      : null;

  function next() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }
  function back() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  function setUnitSystem(nextUnit: "metric" | "imperial") {
    setUnit(nextUnit);
    setWeightText(String(Math.round(nextUnit === "imperial" ? weightKg * 2.20462 : weightKg)));
    setHeightText(String(Math.round(nextUnit === "imperial" ? heightCm / 2.54 : heightCm)));
  }
  function onWeightTextChange(v: string) {
    setWeightText(v);
    const num = parseFloat(v) || 0;
    setWeightKg(unit === "imperial" ? num / 2.20462 : num);
  }
  function onHeightTextChange(v: string) {
    setHeightText(v);
    const num = parseFloat(v) || 0;
    setHeightCm(unit === "imperial" ? num * 2.54 : num);
  }

  function handleSave() {
    if (!targets) return;
    updateProfile.mutate(
      { displayName: name.trim(), ...targets },
      {
        onSuccess: () => {
          clearDraft();
          onSaved?.();
        },
      },
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-4 pt-10">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Let's build your plan</h1>
        <p className="mt-1 text-sm text-neutral-500">
          A few quick questions and NutriSnap will calculate your daily calorie and macro
          targets.
        </p>
      </header>

      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              i <= stepIndex ? "bg-primary-600" : "bg-neutral-200"
            }`}
          />
        ))}
      </div>

      {step === "basics" && (
        <Card className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            What should we call you?
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              maxLength={40}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Age
            <input
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 29"
            />
          </label>
        </Card>
      )}

      {step === "body" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Units
            </span>
            <div className="inline-flex rounded-md bg-neutral-100 p-1">
              <button
                type="button"
                aria-pressed={unit === "metric"}
                onClick={() => setUnitSystem("metric")}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  unit === "metric" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                Metric
              </button>
              <button
                type="button"
                aria-pressed={unit === "imperial"}
                onClick={() => setUnitSystem("imperial")}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  unit === "imperial" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                Imperial
              </button>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Weight ({unit === "imperial" ? "lb" : "kg"})
            <input
              type="number"
              className={inputClass}
              value={weightText}
              onChange={(e) => onWeightTextChange(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Height ({unit === "imperial" ? "in" : "cm"})
            <input
              type="number"
              className={inputClass}
              value={heightText}
              onChange={(e) => onHeightTextChange(e.target.value)}
            />
          </label>
        </Card>
      )}

      {step === "activity" && (
        <div className="flex flex-col gap-2">
          {ACTIVITY_LEVEL_OPTIONS.map((a) => (
            <OptionRow
              key={a.id}
              selected={activityLevel === a.id}
              onClick={() => setActivityLevel(a.id)}
              Icon={ACTIVITY_ICONS[a.id]}
              label={a.label}
              sub={a.sub}
            />
          ))}
        </div>
      )}

      {step === "goal" && (
        <div className="flex flex-col gap-2">
          {FITNESS_GOAL_OPTIONS.map((g) => (
            <OptionRow
              key={g.id}
              selected={goal === g.id}
              onClick={() => setGoal(g.id)}
              Icon={GOAL_ICONS[g.id]}
              label={g.label}
              sub={g.sub}
            />
          ))}
        </div>
      )}

      {step === "review" && targets && (
        <Card className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Daily calorie target
            </p>
            <p className="text-3xl font-bold text-neutral-900">
              {targets.dailyCalorieGoal.toLocaleString()}{" "}
              <span className="text-base font-medium text-neutral-500">kcal</span>
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-2">
            <div className="rounded-lg bg-neutral-50 p-2">
              <p className="text-lg font-bold" style={{ color: colors.macro.protein }}>
                {targets.dailyProteinGoalG}g
              </p>
              <p className="text-xs text-neutral-500">Protein</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2">
              <p className="text-lg font-bold" style={{ color: colors.macro.carbs }}>
                {targets.dailyCarbsGoalG}g
              </p>
              <p className="text-xs text-neutral-500">Carbs</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2">
              <p className="text-lg font-bold" style={{ color: colors.macro.fat }}>
                {targets.dailyFatGoalG}g
              </p>
              <p className="text-xs text-neutral-500">Fat</p>
            </div>
          </div>
          {updateProfile.isError && (
            <p className="text-sm text-danger-600">
              Something went wrong saving your plan — please try again.
            </p>
          )}
        </Card>
      )}

      <div className="mt-auto flex gap-3 pb-6">
        {stepIndex > 0 && (
          <Button variant="secondary" onClick={back} disabled={updateProfile.isPending}>
            Back
          </Button>
        )}
        {step === "review" ? (
          <Button className="flex-1" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving…" : onSaved ? "Save changes" : "Enter NutriSnap"}
          </Button>
        ) : (
          <Button className="flex-1" onClick={next} disabled={!canContinue[step]}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
