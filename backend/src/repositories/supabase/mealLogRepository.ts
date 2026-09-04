import { supabase } from "./client.js";
import type { MealLog, MealLogRepository, NewMealLog } from "../types.js";

interface Row {
  id: string;
  user_id: string;
  photo_path: string;
  food_items: MealLog["items"];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  logged_at: string;
  created_at: string;
  scan_history_id: string | null;
}

function toDomain(row: Row): MealLog {
  return {
    id: row.id,
    userId: row.user_id,
    photoPath: row.photo_path,
    items: row.food_items,
    totalCalories: row.total_calories,
    totalProteinG: row.total_protein_g,
    totalCarbsG: row.total_carbs_g,
    totalFatG: row.total_fat_g,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    scanHistoryId: row.scan_history_id,
  };
}

class SupabaseMealLogRepository implements MealLogRepository {
  async create(userId: string, log: NewMealLog): Promise<MealLog> {
    const { data, error } = await supabase
      .from("meal_logs")
      .insert({
        user_id: userId,
        photo_path: log.photoPath,
        food_items: log.items,
        total_calories: log.totalCalories,
        total_protein_g: log.totalProteinG,
        total_carbs_g: log.totalCarbsG,
        total_fat_g: log.totalFatG,
        logged_at: log.loggedAt,
        scan_history_id: log.scanHistoryId ?? null,
      })
      .select()
      .single<Row>();

    if (error || !data) throw new Error(`Failed to create meal log: ${error?.message}`);
    return toDomain(data);
  }

  async listByUser(
    userId: string,
    opts: { limit?: number; before?: string; cursor?: string } = {},
  ): Promise<{ items: MealLog[]; nextCursor: string | null }> {
    const limit = opts.limit ?? 20;
    let query = supabase
      .from("meal_logs")
      .select()
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(limit + 1);

    if (opts.before) query = query.lt("logged_at", opts.before);
    if (opts.cursor) query = query.lt("logged_at", opts.cursor);

    const { data, error } = await query.returns<Row[]>();
    if (error) throw new Error(`Failed to list meal logs: ${error.message}`);

    const rows = data ?? [];
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const items = page.map(toDomain);
    const nextCursor = hasMore ? items[items.length - 1]?.loggedAt ?? null : null;

    return { items, nextCursor };
  }

  async getById(userId: string, id: string): Promise<MealLog | null> {
    const { data, error } = await supabase
      .from("meal_logs")
      .select()
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle<Row>();

    if (error) throw new Error(`Failed to get meal log: ${error.message}`);
    return data ? toDomain(data) : null;
  }

  async listForDate(userId: string, isoDate: string): Promise<MealLog[]> {
    const start = `${isoDate}T00:00:00.000Z`;
    const end = `${isoDate}T23:59:59.999Z`;
    const { data, error } = await supabase
      .from("meal_logs")
      .select()
      .eq("user_id", userId)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .returns<Row[]>();

    if (error) throw new Error(`Failed to list meal logs for date: ${error.message}`);
    return (data ?? []).map(toDomain);
  }
}

export const mealLogRepository: MealLogRepository = new SupabaseMealLogRepository();
