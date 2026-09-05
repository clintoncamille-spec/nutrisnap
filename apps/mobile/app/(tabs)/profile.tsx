import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useProfile } from "@nutrisnap/shared";
import { colors } from "@nutrisnap/config/design-tokens";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile(apiClient);

  return (
    <View className="flex-1 gap-6 bg-neutral-50 p-4 pt-16">
      <View>
        <Text className="text-2xl font-semibold text-neutral-900">Profile</Text>
        <Text className="text-sm text-neutral-500">Your plan and daily targets.</Text>
      </View>

      <Card>
        {isLoading ? (
          <Text className="text-sm text-neutral-400">Loading…</Text>
        ) : isError || !profile ? (
          <View className="items-start gap-2">
            <Text className="text-sm text-danger-600">Couldn&apos;t load your profile.</Text>
            <Text onPress={() => refetch()} className="text-sm font-medium text-primary-700">
              Try again
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-sm font-medium text-neutral-700">
              {profile.displayName ?? "Your plan"}
            </Text>
            <View className="mt-4 flex-row justify-between">
              <View className="items-center">
                <Text className="text-lg font-bold text-neutral-900">
                  {profile.dailyCalorieGoal.toLocaleString()}
                </Text>
                <Text className="text-xs text-neutral-500">kcal</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold" style={{ color: colors.macro.protein }}>
                  {profile.dailyProteinGoalG}g
                </Text>
                <Text className="text-xs text-neutral-500">Protein</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold" style={{ color: colors.macro.carbs }}>
                  {profile.dailyCarbsGoalG}g
                </Text>
                <Text className="text-xs text-neutral-500">Carbs</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold" style={{ color: colors.macro.fat }}>
                  {profile.dailyFatGoalG}g
                </Text>
                <Text className="text-xs text-neutral-500">Fat</Text>
              </View>
            </View>
          </>
        )}
      </Card>

      <Button
        variant="secondary"
        label="Recalculate my plan"
        onPress={() => router.push("/onboarding")}
      />

      <View className="gap-2 border-t border-neutral-200 pt-4">
        {session?.user.email && (
          <Text className="text-sm text-neutral-500">
            Signed in as{" "}
            <Text className="font-medium text-neutral-700">{session.user.email}</Text>
          </Text>
        )}
        <Button variant="secondary" label="Log out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}
