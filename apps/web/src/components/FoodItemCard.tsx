import { X } from "lucide-react";
import type { FoodItem } from "@nutrisnap/shared";
import { Card } from "./Card";

// A generous sanity ceiling for a single food item's portion — well beyond
// any real serving, just there to stop a manual entry like "99999" from
// silently scaling macros into nonsense.
const MAX_GRAMS = 5000;

interface Props {
  item: FoodItem;
  onGramsChange: (grams: number) => void;
  onRemove: () => void;
}

export function FoodItemCard({ item, onGramsChange, onRemove }: Props) {
  const lowConfidence = item.confidence < 0.6;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-neutral-900">{item.name}</p>
          {lowConfidence && (
            <span className="text-xs text-accent-600">low confidence — double check this</span>
          )}
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="text-neutral-400 hover:text-danger-500"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(500, item.estimatedGrams * 2)}
          value={item.estimatedGrams}
          onChange={(e) => onGramsChange(Number(e.target.value))}
          className="flex-1 accent-primary-600"
        />
        <input
          type="number"
          min={0}
          max={MAX_GRAMS}
          value={Math.round(item.estimatedGrams)}
          onChange={(e) =>
            onGramsChange(Math.min(Math.max(Number(e.target.value) || 0, 0), MAX_GRAMS))
          }
          className="w-16 rounded-md border border-neutral-200 px-2 py-1 text-sm"
        />
        <span className="text-xs text-neutral-500">g</span>
      </div>

      <div className="flex gap-4 text-xs text-neutral-600">
        <span>{Math.round(item.calories)} kcal</span>
        <span>{item.proteinG.toFixed(1)}g protein</span>
        <span>{item.carbsG.toFixed(1)}g carbs</span>
        <span>{item.fatG.toFixed(1)}g fat</span>
      </div>
    </Card>
  );
}
