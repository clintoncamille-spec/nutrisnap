import { useMemo, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useEditableFoodItems,
  useSaveFavoriteRecipe,
  useSaveMealLog,
  type FridgeAnalysisResult,
  type MealAnalysisResult,
} from "@nutrisnap/shared";
import { apiClient } from "../../lib/apiClient";
import { FoodItemCard } from "../../components/FoodItemCard";
import { RecipeCard } from "../../components/RecipeCard";
import { Button } from "../../components/Button";

export default function Results() {
  const { mode, result } = useLocalSearchParams<{
    mode: "meal" | "fridge";
    result?: string;
  }>();

  const parsed = useMemo(() => {
    if (!result) return null;
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  }, [result]);

  if (!parsed) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-neutral-600">No scan result to show.</Text>
      </View>
    );
  }

  return mode === "fridge" ? (
    <FridgeResults result={parsed as FridgeAnalysisResult} />
  ) : (
    <MealResults result={parsed as MealAnalysisResult} />
  );
}

function MealResults({ result }: { result: MealAnalysisResult }) {
  const router = useRouter();
  const { items, totals, setGrams, remove } = useEditableFoodItems(result.items);
  const saveMealLog = useSaveMealLog(apiClient);

  const handleSave = () => {
    saveMealLog.mutate(
      {
        scanId: result.scanId,
        photoPath: result.photoPath,
        items,
        totalCalories: totals.calories,
        totalProteinG: totals.proteinG,
        totalCarbsG: totals.carbsG,
        totalFatG: totals.fatG,
        loggedAt: new Date().toISOString(),
      },
      { onSuccess: () => router.replace("/") },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4 pb-24"
        ListHeaderComponent={
          <Text className="mb-2 text-xl font-semibold text-neutral-900">
            Meal breakdown
          </Text>
        }
        renderItem={({ item }) => (
          <FoodItemCard
            item={item}
            onGramsChange={(grams) => setGrams(item.id, grams)}
            onRemove={() => remove(item.id)}
          />
        )}
      />
      <View className="flex-row items-center justify-between gap-4 border-t border-neutral-200 bg-white p-4">
        <Text className="text-sm">
          <Text className="font-semibold">{Math.round(totals.calories)} kcal</Text>
          {"  "}P {totals.proteinG.toFixed(0)}g · C {totals.carbsG.toFixed(0)}g · F{" "}
          {totals.fatG.toFixed(0)}g
        </Text>
        <Button
          label={saveMealLog.isPending ? "Saving…" : "Save to log"}
          onPress={handleSave}
          disabled={saveMealLog.isPending || items.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

function FridgeResults({ result }: { result: FridgeAnalysisResult }) {
  const [favoritedTitles, setFavoritedTitles] = useState<Set<string>>(new Set());
  const saveFavorite = useSaveFavoriteRecipe(apiClient);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["bottom"]}>
      <FlatList
        data={result.recipes}
        keyExtractor={(recipe) => recipe.title}
        contentContainerClassName="gap-3 p-4"
        ListHeaderComponent={
          <View className="mb-2">
            <Text className="text-xl font-semibold text-neutral-900">Recipe ideas</Text>
            <Text className="text-sm text-neutral-500">
              Detected: {result.ingredientsDetected.map((i) => i.name).join(", ")}
            </Text>
          </View>
        }
        renderItem={({ item: recipe }) => (
          <RecipeCard
            recipe={recipe}
            isFavorited={favoritedTitles.has(recipe.title)}
            isSaving={saveFavorite.isPending}
            onFavorite={() =>
              saveFavorite.mutate(
                { recipe, sourceScanId: result.scanId },
                {
                  onSuccess: () =>
                    setFavoritedTitles((prev) => new Set(prev).add(recipe.title)),
                },
              )
            }
          />
        )}
      />
    </SafeAreaView>
  );
}
