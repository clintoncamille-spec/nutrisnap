import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useEditableFoodItems,
  useSaveFavoriteRecipe,
  useSaveMealLog,
  type FridgeAnalysisResult,
  type MealAnalysisResult,
} from "@nutrisnap/shared";
import { apiClient } from "../lib/apiClient";
import { FoodItemCard } from "../components/FoodItemCard";
import { RecipeCard } from "../components/RecipeCard";
import { Button } from "../components/Button";

type Mode = "meal" | "fridge";

export function Results() {
  const { mode } = useParams<{ mode: Mode }>();
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: unknown } | null)?.result;

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center">
        <p className="text-neutral-600">No scan result to show.</p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return mode === "fridge" ? (
    <FridgeResults result={result as FridgeAnalysisResult} />
  ) : (
    <MealResults result={result as MealAnalysisResult} />
  );
}

function MealResults({ result }: { result: MealAnalysisResult }) {
  const navigate = useNavigate();
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
      { onSuccess: () => navigate("/") },
    );
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-24">
      <h1 className="text-xl font-semibold text-neutral-900">Meal breakdown</h1>

      {result.warnings && result.warnings.length > 0 && (
        <div className="rounded-md bg-accent-50 p-3 text-xs text-accent-600">
          {result.warnings.join(" · ")}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <FoodItemCard
            key={item.id}
            item={item}
            onGramsChange={(grams) => setGrams(item.id, grams)}
            onRemove={() => remove(item.id)}
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white p-4">
        <div className="text-sm">
          <span className="font-semibold">{Math.round(totals.calories)} kcal</span>
          <span className="ml-2 text-neutral-500">
            P {totals.proteinG.toFixed(0)}g · C {totals.carbsG.toFixed(0)}g · F{" "}
            {totals.fatG.toFixed(0)}g
          </span>
        </div>
        <Button onClick={handleSave} disabled={saveMealLog.isPending || items.length === 0}>
          {saveMealLog.isPending ? "Saving…" : "Save to log"}
        </Button>
      </div>
    </div>
  );
}

function FridgeResults({ result }: { result: FridgeAnalysisResult }) {
  const [favoritedTitles, setFavoritedTitles] = useState<Set<string>>(new Set());
  const saveFavorite = useSaveFavoriteRecipe(apiClient);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-neutral-900">Recipe ideas</h1>
      <p className="text-sm text-neutral-500">
        Detected: {result.ingredientsDetected.map((i) => i.name).join(", ")}
      </p>

      <div className="flex flex-col gap-3">
        {result.recipes.map((recipe) => (
          <RecipeCard
            key={recipe.title}
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
        ))}
      </div>
    </div>
  );
}
