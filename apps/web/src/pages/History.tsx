import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMealHistory, useFavoriteRecipes } from "@nutrisnap/shared";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { RecipeCard } from "../components/RecipeCard";

type Tab = "history" | "favorites" | "profile";

export function History() {
  const [tab, setTab] = useState<Tab>("history");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <div className="flex gap-2 border-b border-neutral-200">
        {(["history", "favorites", "profile"] as Tab[]).map((t) => (
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
      {tab === "profile" && <ProfileTab />}
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

function ProfileTab() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.getProfile(),
  });
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

  const updateProfile = useMutation({
    mutationFn: (dailyCalorieGoal: number) =>
      apiClient.updateProfile({ dailyCalorieGoal }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const goalValue = calorieGoal ?? profile?.dailyCalorieGoal ?? 2000;

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        Signed in as <span className="font-medium">{session?.user.email}</span>
      </p>

      <label className="flex flex-col gap-1 text-sm text-neutral-700">
        Daily calorie goal
        <div className="flex gap-2">
          <input
            type="number"
            value={goalValue}
            disabled={isLoading}
            onChange={(e) => setCalorieGoal(Number(e.target.value))}
            className="w-32 rounded-md border border-neutral-200 px-2 py-1"
          />
          <Button
            variant="secondary"
            disabled={updateProfile.isPending}
            onClick={() => updateProfile.mutate(goalValue)}
          >
            Save
          </Button>
        </div>
      </label>

      <Button variant="secondary" onClick={() => supabase.auth.signOut()} className="w-fit">
        Log out
      </Button>
    </Card>
  );
}
