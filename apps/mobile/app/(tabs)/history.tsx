import { useState } from "react";
import { View, Text, Pressable, FlatList, RefreshControl, TextInput } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMealHistory, useFavoriteRecipes } from "@nutrisnap/shared";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { RecipeCard } from "../../components/RecipeCard";

type Tab = "history" | "favorites" | "profile";

export default function HistoryScreen() {
  const [tab, setTab] = useState<Tab>("history");

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="flex-row border-b border-neutral-200 bg-white px-4 pt-2">
        {(["history", "favorites", "profile"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} className="mr-4 pb-2">
            <Text
              className={`text-sm font-medium capitalize ${
                tab === t ? "text-primary-700" : "text-neutral-400"
              }`}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "history" && <MealHistoryTab />}
      {tab === "favorites" && <FavoritesTab />}
      {tab === "profile" && <ProfileTab />}
    </View>
  );
}

function MealHistoryTab() {
  const { data, isLoading, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useMealHistory(apiClient);
  const logs = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) return <Text className="p-4 text-sm text-neutral-400">Loading…</Text>;

  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 p-4"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      ListEmptyComponent={
        <Text className="text-sm text-neutral-500">No meals logged yet.</Text>
      }
      renderItem={({ item: log }) => (
        <Card className="flex-row items-center justify-between">
          <View>
            <Text className="font-medium text-neutral-900">
              {new Date(log.loggedAt).toLocaleString()}
            </Text>
            <Text className="text-xs text-neutral-500">{log.items.length} items</Text>
          </View>
          <Text className="font-semibold">{Math.round(log.totalCalories)} kcal</Text>
        </Card>
      )}
    />
  );
}

function FavoritesTab() {
  const { data, isLoading } = useFavoriteRecipes(apiClient);

  if (isLoading) return <Text className="p-4 text-sm text-neutral-400">Loading…</Text>;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 p-4"
      ListEmptyComponent={
        <Text className="text-sm text-neutral-500">No favorite recipes yet.</Text>
      }
      renderItem={({ item: favorite }) => (
        <RecipeCard recipe={favorite.recipe} isFavorited onFavorite={() => {}} />
      )}
    />
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
    <View className="gap-4 p-4">
      <Card className="gap-4">
        <Text className="text-sm text-neutral-600">
          Signed in as {session?.user.email}
        </Text>

        <View className="gap-1">
          <Text className="text-sm text-neutral-700">Daily calorie goal</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={String(goalValue)}
              editable={!isLoading}
              onChangeText={(text) => setCalorieGoal(Number(text) || 0)}
              keyboardType="numeric"
              className="w-24 rounded-md border border-neutral-200 px-2 py-1"
            />
            <Button
              variant="secondary"
              label="Save"
              disabled={updateProfile.isPending}
              onPress={() => updateProfile.mutate(goalValue)}
            />
          </View>
        </View>

        <Button
          variant="secondary"
          label="Log out"
          onPress={() => supabase.auth.signOut()}
        />
      </Card>
    </View>
  );
}
