import { Camera, Refrigerator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDailySummary } from "@nutrisnap/shared";
import { colors } from "../../../../packages/config/design-tokens.mjs";

import { apiClient } from "../lib/apiClient";
import { Card } from "../components/Card";
import { ProgressRing } from "../components/ProgressRing";

export function Home() {
  const navigate = useNavigate();
  const { data, progress, isLoading } = useDailySummary(apiClient);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">NutriSnap</h1>
        <p className="text-sm text-neutral-500">What are we tracking today?</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/scan/meal")}
          className="flex flex-col items-center gap-2 rounded-lg bg-primary-600 p-6 text-white hover:bg-primary-700"
        >
          <Camera size={28} />
          <span className="font-medium">Scan Meal</span>
          <span className="text-xs text-primary-100">Calories &amp; macros</span>
        </button>
        <button
          onClick={() => navigate("/scan/fridge")}
          className="flex flex-col items-center gap-2 rounded-lg bg-accent-500 p-6 text-white hover:bg-accent-600"
        >
          <Refrigerator size={28} />
          <span className="font-medium">Scan Fridge</span>
          <span className="text-xs text-orange-100">Get recipe ideas</span>
        </button>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-neutral-700">
          Today's progress
        </h2>
        {isLoading || !data ? (
          <p className="text-sm text-neutral-400">Loading…</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <ProgressRing
              progress={progress?.calories ?? 0}
              color={colors.macro.calories}
              value={`${Math.round(data.caloriesConsumed)}`}
              label={`/ ${data.caloriesGoal} kcal`}
            />
            <ProgressRing
              progress={progress?.protein ?? 0}
              color={colors.macro.protein}
              value={`${Math.round(data.proteinG)}g`}
              label="protein"
            />
            <ProgressRing
              progress={progress?.carbs ?? 0}
              color={colors.macro.carbs}
              value={`${Math.round(data.carbsG)}g`}
              label="carbs"
            />
            <ProgressRing
              progress={progress?.fat ?? 0}
              color={colors.macro.fat}
              value={`${Math.round(data.fatG)}g`}
              label="fat"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
