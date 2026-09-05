import { useState } from "react";
import { useMealHistory, useFavoriteRecipes } from "@nutrisnap/shared";
import { apiClient } from "../lib/apiClient";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { RecipeCard } from "../components/RecipeCard";

type Tab = "history" | "favorites";

export function History() {
  const [tab, setTab] = useState<Tab>("history");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <div className="flex gap-2 border-b border-neutral-200">
        {(["history", "favorites"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "border-b-2 border-primary-600 text-primary-700"
                : "text-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "history" && <MealHistoryTab />}
      {tab === "favorites" && <FavoritesTab />}
    </div>
  );
}

function MealHistoryTab() {
  const { data, isLoading, fetchNextPage, hasNextPage } = useMealHistory(apiClient);
  const logs = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) return <p className="text-sm text-neutral-400">Loading…</p>;
  if (logs.length === 0) return <p className="text-sm text-neutral-500">No meals logged yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log) => (
        <Card key={log.id} className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">
              {new Date(log.loggedAt).toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500">{log.items.length} items</p>
          </div>
          <span className="font-semibold">{Math.round(log.totalCalories)} kcal</span>
        </Card>
      ))}
      {hasNextPage && (
        <Button variant="secondary" onClick={() => fetchNextPage()}>
          Load more
        </Button>
      )}
    </div>
  );
}

function FavoritesTab() {
  const { data, isLoading } = useFavoriteRecipes(apiClient);

  if (isLoading) return <p className="text-sm text-neutral-400">Loading…</p>;
  if (!data || data.length === 0) {
    return <p className="text-sm text-neutral-500">No favorite recipes yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((favorite) => (
        <RecipeCard key={favorite.id} recipe={favorite.recipe} isFavorited onFavorite={() => {}} />
      ))}
    </div>
  );
}
