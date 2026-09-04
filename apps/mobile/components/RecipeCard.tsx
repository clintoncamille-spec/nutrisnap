import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown, ChevronUp, Heart } from "lucide-react-native";
import type { Recipe } from "@nutrisnap/shared";
import { Card } from "./Card";

interface Props {
  recipe: Recipe;
  onFavorite: () => void;
  isFavorited?: boolean;
  isSaving?: boolean;
}

export function RecipeCard({ recipe, onFavorite, isFavorited, isSaving }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="gap-3">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-semibold text-neutral-900">{recipe.title}</Text>
          <Text className="text-xs text-neutral-500">
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min total ·{" "}
            {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}
          </Text>
        </View>
        <Pressable onPress={onFavorite} disabled={isSaving} hitSlop={8}>
          <Heart
            size={20}
            color={isFavorited ? "#ef4444" : "#a3a3a3"}
            fill={isFavorited ? "#ef4444" : "none"}
          />
        </Pressable>
      </View>

      <View className="flex-row gap-4">
        <Text className="text-xs text-neutral-600">
          {Math.round(recipe.nutritionPerServing.calories)} kcal
        </Text>
        <Text className="text-xs text-neutral-600">
          {recipe.nutritionPerServing.proteinG}g protein
        </Text>
        <Text className="text-xs text-neutral-600">
          {recipe.nutritionPerServing.carbsG}g carbs
        </Text>
        <Text className="text-xs text-neutral-600">
          {recipe.nutritionPerServing.fatG}g fat
        </Text>
      </View>

      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center gap-1"
      >
        <Text className="text-sm font-medium text-primary-700">
          {expanded ? "Hide steps" : "Show steps"}
        </Text>
        {expanded ? (
          <ChevronUp size={16} color="#15803d" />
        ) : (
          <ChevronDown size={16} color="#15803d" />
        )}
      </Pressable>

      {expanded && (
        <View className="gap-1 pl-2">
          {recipe.steps.map((step, i) => (
            <Text key={i} className="text-sm text-neutral-700">
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );
}
