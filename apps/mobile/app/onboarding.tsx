import { useState } from "react";
import type { ComponentType } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Activity,
  Armchair,
  Bike,
  Equal,
  Flame,
  Footprints,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import {
  ACTIVITY_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  calcOnboardingTargets,
  useUpdateProfile,
  type ActivityLevel,
  type FitnessGoal,
} from "@nutrisnap/shared";
import { colors } from "@nutrisnap/config/design-tokens";
import { apiClient } from "../lib/apiClient";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

type IconType = ComponentType<{ size?: number; color?: string }>;

const ACTIVITY_ICONS: Record<ActivityLevel, IconType> = {
  sedentary: Armchair,
  light: Footprints,
  moderate: Bike,
  active: Activity,
  athlete: Flame,
};

const GOAL_ICONS: Record<FitnessGoal, IconType> = {
  lose: TrendingDown,
  maintain: Equal,
  build: TrendingUp,
};

const STEPS = ["basics", "body", "activity", "goal", "review"] as const;
type Step = (typeof STEPS)[number];

function OptionRow({
  selected,
  onPress,
  Icon,
  label,
  sub,
}: {
  selected: boolean;
  onPress: () => void;
  Icon: IconType;
  label: string;
  sub: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-lg border p-3 ${
        selected ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white"
      }`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-md ${
          selected ? "bg-primary-600" : "bg-neutral-100"
        }`}
      >
        <Icon size={18} color={selected ? "white" : "#525252"} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-neutral-900">{label}</Text>
        <Text className="text-xs text-neutral-500">{sub}</Text>
      </View>
    </Pressable>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const updateProfile = useUpdateProfile(apiClient);

  const [step, setStep] = useState<Step>("basics");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(170);
  const [weightText, setWeightText] = useState("70");
  const [heightText, setHeightText] = useState("170");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [goal, setGoal] = useState<FitnessGoal | "">("");

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
      { onSuccess: () => router.replace("/") },
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-neutral-50"
    >
      <ScrollView contentContainerClassName="gap-6 p-4 pt-16" keyboardShouldPersistTaps="handled">
        <View>
          <Text className="text-2xl font-semibold text-neutral-900">
            Let&apos;s build your plan
          </Text>
          <Text className="mt-1 text-sm text-neutral-500">
            A few quick questions and NutriSnap will calculate your daily calorie and macro
            targets.
          </Text>
        </View>

        <View className="flex-row gap-1.5">
          {STEPS.map((s, i) => (
            <View
              key={s}
              className={`h-1 flex-1 rounded-full ${
                i <= stepIndex ? "bg-primary-600" : "bg-neutral-200"
              }`}
            />
          ))}
        </View>

        {step === "basics" && (
          <Card className="gap-3">
            <View className="gap-1">
              <Text className="text-sm font-medium text-neutral-700">
                What should we call you?
              </Text>
              <TextInput
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                maxLength={40}
              />
            </View>
            <View className="gap-1">
              <Text className="text-sm font-medium text-neutral-700">Age</Text>
              <TextInput
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 29"
                keyboardType="number-pad"
              />
            </View>
          </Card>
        )}

        {step === "body" && (
          <Card className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase text-neutral-500">Units</Text>
              <View className="flex-row rounded-md bg-neutral-100 p-1">
                <Pressable
                  onPress={() => setUnitSystem("metric")}
                  className={`rounded px-2.5 py-1 ${unit === "metric" ? "bg-white" : ""}`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      unit === "metric" ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    Metric
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setUnitSystem("imperial")}
                  className={`rounded px-2.5 py-1 ${unit === "imperial" ? "bg-white" : ""}`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      unit === "imperial" ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    Imperial
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="gap-1">
              <Text className="text-sm font-medium text-neutral-700">
                Weight ({unit === "imperial" ? "lb" : "kg"})
              </Text>
              <TextInput
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                value={weightText}
                onChangeText={onWeightTextChange}
                keyboardType="numeric"
              />
            </View>
            <View className="gap-1">
              <Text className="text-sm font-medium text-neutral-700">
                Height ({unit === "imperial" ? "in" : "cm"})
              </Text>
              <TextInput
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                value={heightText}
                onChangeText={onHeightTextChange}
                keyboardType="numeric"
              />
            </View>
          </Card>
        )}

        {step === "activity" && (
          <View className="gap-2">
            {ACTIVITY_LEVEL_OPTIONS.map((a) => (
              <OptionRow
                key={a.id}
                selected={activityLevel === a.id}
                onPress={() => setActivityLevel(a.id)}
                Icon={ACTIVITY_ICONS[a.id]}
                label={a.label}
                sub={a.sub}
              />
            ))}
          </View>
        )}

        {step === "goal" && (
          <View className="gap-2">
            {FITNESS_GOAL_OPTIONS.map((g) => (
              <OptionRow
                key={g.id}
                selected={goal === g.id}
                onPress={() => setGoal(g.id)}
                Icon={GOAL_ICONS[g.id]}
                label={g.label}
                sub={g.sub}
              />
            ))}
          </View>
        )}

        {step === "review" && targets && (
          <Card className="items-center gap-4">
            <View className="items-center">
              <Text className="text-xs font-semibold uppercase text-neutral-500">
                Daily calorie target
              </Text>
              <Text className="text-3xl font-bold text-neutral-900">
                {targets.dailyCalorieGoal.toLocaleString()}{" "}
                <Text className="text-base font-medium text-neutral-500">kcal</Text>
              </Text>
            </View>
            <View className="w-full flex-row gap-2">
              <View className="flex-1 items-center rounded-lg bg-neutral-50 p-2">
                <Text className="text-lg font-bold" style={{ color: colors.macro.protein }}>
                  {targets.dailyProteinGoalG}g
                </Text>
                <Text className="text-xs text-neutral-500">Protein</Text>
              </View>
              <View className="flex-1 items-center rounded-lg bg-neutral-50 p-2">
                <Text className="text-lg font-bold" style={{ color: colors.macro.carbs }}>
                  {targets.dailyCarbsGoalG}g
                </Text>
                <Text className="text-xs text-neutral-500">Carbs</Text>
              </View>
              <View className="flex-1 items-center rounded-lg bg-neutral-50 p-2">
                <Text className="text-lg font-bold" style={{ color: colors.macro.fat }}>
                  {targets.dailyFatGoalG}g
                </Text>
                <Text className="text-xs text-neutral-500">Fat</Text>
              </View>
            </View>
            {updateProfile.isError && (
              <Text className="text-sm text-danger-600">
                Something went wrong saving your plan — please try again.
              </Text>
            )}
          </Card>
        )}

        <View className="flex-row gap-3">
          {stepIndex > 0 && (
            <Button
              variant="secondary"
              label="Back"
              onPress={back}
              disabled={updateProfile.isPending}
            />
          )}
          {step === "review" ? (
            <View className="flex-1">
              <Button
                label={updateProfile.isPending ? "Saving…" : "Enter NutriSnap"}
                onPress={handleSave}
                disabled={updateProfile.isPending}
              />
            </View>
          ) : (
            <View className="flex-1">
              <Button label="Continue" onPress={next} disabled={!canContinue[step]} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
