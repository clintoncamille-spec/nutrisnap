import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Camera, Refrigerator } from "lucide-react-native";
import { useDailySummary } from "@nutrisnap/shared";
import { colors } from "@nutrisnap/config/design-tokens";
import { apiClient } from "../../lib/apiClient";
import { Card } from "../../components/Card";
import { ProgressRing } from "../../components/ProgressRing";

export default function Home() {
  const router = useRouter();
  const { data, progress, isLoading } = useDailySummary(apiClient);

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-6 p-4">
      <View>
        <Text className="text-2xl font-semibold text-neutral-900">NutriSnap</Text>
        <Text className="text-sm text-neutral-500">What are we tracking today?</Text>
      </View>

      <View className="flex-row gap-4">
        <Pressable
          onPress={() => router.push("/scan/meal")}
          className="flex-1 items-center gap-2 rounded-lg bg-primary-600 p-6"
        >
          <Camera color="white" size={28} />
          <Text className="font-medium text-white">Scan Meal</Text>
          <Text className="text-xs text-primary-100">Calories & macros</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/scan/fridge")}
          className="flex-1 items-center gap-2 rounded-lg bg-accent-500 p-6"
        >
          <Refrigerator color="white" size={28} />
          <Text className="font-medium text-white">Scan Fridge</Text>
          <Text className="text-xs text-orange-100">Get recipe ideas</Text>
        </Pressable>
      </View>

      <Card>
        <Text className="mb-4 text-sm font-medium text-neutral-700">Today's progress</Text>
        {isLoading || !data ? (
          <Text className="text-sm text-neutral-400">Loading…</Text>
        ) : (
          <View className="flex-row justify-between">
            <ProgressRing
              progress={progress?.calories ?? 0}
              color={colors.macro.calories}
              value={`${Math.round(data.caloriesConsumed)}`}
              label={`/ ${data.caloriesGoal} kcal`}
            />
            <ProgressRing
              progress={progress?.protein ?? 0}
              color={colors.macro.protein}
              value={`${Math.round(data.proteinG)}g`}
              label="protein"
            />
            <ProgressRing
              progress={progress?.carbs ?? 0}
              color={colors.macro.carbs}
              value={`${Math.round(data.carbsG)}g`}
              label="carbs"
            />
            <ProgressRing
              progress={progress?.fat ?? 0}
              color={colors.macro.fat}
              value={`${Math.round(data.fatG)}g`}
              label="fat"
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
