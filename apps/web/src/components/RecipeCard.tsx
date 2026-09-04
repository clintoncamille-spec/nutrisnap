import { useState } from "react";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import type { Recipe } from "@nutrisnap/shared";
import { Card } from "./Card";
import { Button } from "./Button";

interface Props {
  recipe: Recipe;
  onFavorite: () => void;
  isFavorited?: boolean;
  isSaving?: boolean;
}

export function RecipeCard({ recipe, onFavorite, isFavorited, isSaving }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900">{recipe.title}</h3>
          <p className="text-xs text-neutral-500">
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min total ·{" "}
            {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={onFavorite}
          disabled={isSaving}
          aria-label="Save favorite"
          className={isFavorited ? "text-danger-500" : "text-neutral-400 hover:text-danger-500"}
        >
          <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex gap-4 text-xs text-neutral-600">
        <span>{Math.round(recipe.nutritionPerServing.calories)} kcal</span>
        <span>{recipe.nutritionPerServing.proteinG}g protein</span>
        <span>{recipe.nutritionPerServing.carbsG}g carbs</span>
        <span>{recipe.nutritionPerServing.fatG}g fat</span>
      </div>

      <Button
        variant="ghost"
        className="w-fit px-0 text-primary-700"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Hide steps" : "Show steps"}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>

      {expanded && (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700">
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </Card>
  );
}
