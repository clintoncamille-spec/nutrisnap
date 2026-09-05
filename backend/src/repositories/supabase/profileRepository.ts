import { supabase } from "./client.js";
import type { AdminProfileSummary, Profile, ProfileRepository } from "../types.js";

interface Row {
  id: string;
  display_name: string | null;
  daily_calorie_goal: number;
  daily_protein_goal_g: number;
  daily_carbs_goal_g: number;
  daily_fat_goal_g: number;
  role: "user" | "admin";
}

const DEFAULTS: Omit<Row, "display_name" | "id"> = {
  daily_calorie_goal: 2000,
  daily_protein_goal_g: 100,
  daily_carbs_goal_g: 250,
  daily_fat_goal_g: 65,
  role: "user",
};

function toDomain(row: Row): Profile {
  return {
    displayName: row.display_name,
    dailyCalorieGoal: row.daily_calorie_goal,
    dailyProteinGoalG: row.daily_protein_goal_g,
    dailyCarbsGoalG: row.daily_carbs_goal_g,
    dailyFatGoalG: row.daily_fat_goal_g,
    role: row.role,
  };
}

class SupabaseProfileRepository implements ProfileRepository {
  async get(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .maybeSingle<Row>();

    if (error) throw new Error(`Failed to get profile: ${error.message}`);
    if (data) return toDomain(data);

    // First access — create the row with defaults (profiles are created
    // lazily rather than via an auth trigger, keeping this repository the
    // single place that knows about default goals).
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: userId, display_name: null, ...DEFAULTS })
      .select()
      .single<Row>();

    if (insertError || !created) {
      throw new Error(`Failed to create profile: ${insertError?.message}`);
    }
    return toDomain(created);
  }

  async update(userId: string, patch: Partial<Profile>): Promise<Profile> {
    await this.get(userId); // ensures the row exists
    const { data, error } = await supabase
      .from("profiles")
      // `patch.role` is deliberately not read here — see the note on
      // ProfileRepository.update in types.ts. This is the endpoint a
      // signed-in user calls on their own profile (PATCH /api/profile);
      // handling role here would let any user promote themselves to admin.
      .update({
        ...(patch.displayName !== undefined && { display_name: patch.displayName }),
        ...(patch.dailyCalorieGoal !== undefined && {
          daily_calorie_goal: patch.dailyCalorieGoal,
        }),
        ...(patch.dailyProteinGoalG !== undefined && {
          daily_protein_goal_g: patch.dailyProteinGoalG,
        }),
        ...(patch.dailyCarbsGoalG !== undefined && {
          daily_carbs_goal_g: patch.dailyCarbsGoalG,
        }),
        ...(patch.dailyFatGoalG !== undefined && {
          daily_fat_goal_g: patch.dailyFatGoalG,
        }),
      })
      .eq("id", userId)
      .select()
      .single<Row>();

    if (error || !data) throw new Error(`Failed to update profile: ${error?.message}`);
    return toDomain(data);
  }

  async listAll(): Promise<AdminProfileSummary[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .order("created_at", { ascending: true })
      .returns<Row[]>();

    if (error) throw new Error(`Failed to list profiles: ${error.message}`);
    return (data ?? []).map((row) => ({ id: row.id, ...toDomain(row) }));
  }
}

export const profileRepository: ProfileRepository = new SupabaseProfileRepository();
