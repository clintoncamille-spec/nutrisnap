import { View, Text, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import { Swipeable } from "react-native-gesture-handler";
import { X } from "lucide-react-native";
import type { FoodItem } from "@nutrisnap/shared";
import { Card } from "./Card";

interface Props {
  item: FoodItem;
  onGramsChange: (grams: number) => void;
  onRemove: () => void;
}

export function FoodItemCard({ item, onGramsChange, onRemove }: Props) {
  const lowConfidence = item.confidence < 0.6;

  return (
    <Swipeable
      renderRightActions={() => (
        <View className="w-16 items-center justify-center bg-danger-500">
          <X color="white" size={20} />
        </View>
      )}
      onSwipeableOpen={onRemove}
    >
      <Card className="gap-2">
        <View className="flex-row items-start justify-between">
          <Text className="font-medium text-neutral-900">{item.name}</Text>
          {lowConfidence && (
            <Text className="text-xs text-accent-600">low confidence</Text>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <Slider
            style={{ flex: 1 }}
            minimumValue={0}
            maximumValue={Math.max(500, item.estimatedGrams * 2)}
            value={item.estimatedGrams}
            onSlidingComplete={onGramsChange}
            minimumTrackTintColor="#16a34a"
          />
          <TextInput
            value={String(Math.round(item.estimatedGrams))}
            onChangeText={(text) => onGramsChange(Number(text) || 0)}
            keyboardType="numeric"
            className="w-14 rounded-md border border-neutral-200 px-2 py-1 text-sm"
          />
          <Text className="text-xs text-neutral-500">g</Text>
        </View>

        <View className="flex-row gap-4">
          <Text className="text-xs text-neutral-600">{Math.round(item.calories)} kcal</Text>
          <Text className="text-xs text-neutral-600">{item.proteinG.toFixed(1)}g protein</Text>
          <Text className="text-xs text-neutral-600">{item.carbsG.toFixed(1)}g carbs</Text>
          <Text className="text-xs text-neutral-600">{item.fatG.toFixed(1)}g fat</Text>
        </View>
      </Card>
    </Swipeable>
  );
}
