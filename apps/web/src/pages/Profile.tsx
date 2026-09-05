import { useNavigate } from "react-router-dom";
import { useProfile } from "@nutrisnap/shared";
import { colors } from "../../../../packages/config/design-tokens.mjs";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function Profile() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile(apiClient);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="text-sm text-neutral-500">Your plan and daily targets.</p>
      </header>

      <Card>
        {isLoading ? (
          <p className="text-sm text-neutral-400">Loading…</p>
        ) : isError || !profile ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-danger-600">Couldn't load your profile.</p>
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-primary-700 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-neutral-700">
              {profile.displayName ?? "Your plan"}
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-neutral-900">
                  {profile.dailyCalorieGoal.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500">kcal</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: colors.macro.protein }}>
                  {profile.dailyProteinGoalG}g
                </p>
                <p className="text-xs text-neutral-500">Protein</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: colors.macro.carbs }}>
                  {profile.dailyCarbsGoalG}g
                </p>
                <p className="text-xs text-neutral-500">Carbs</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: colors.macro.fat }}>
                  {profile.dailyFatGoalG}g
                </p>
                <p className="text-xs text-neutral-500">Fat</p>
              </div>
            </div>
          </>
        )}
      </Card>

      <Button variant="secondary" onClick={() => navigate("/onboarding")}>
        Recalculate my plan
      </Button>

      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4">
        {session?.user.email && (
          <p className="text-sm text-neutral-500">
            Signed in as <span className="font-medium text-neutral-700">{session.user.email}</span>
          </p>
        )}
        <Button
          variant="secondary"
          className="w-fit"
          onClick={() => supabase.auth.signOut()}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
