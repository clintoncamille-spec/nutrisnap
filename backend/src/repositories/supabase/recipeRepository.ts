import { supabase } from "./client.js";
import type { Recipe } from "../../services/vision/types.js";
import type { FavoriteRecipe, RecipeRepository } from "../types.js";

interface Row {
  id: string;
  user_id: string;
  source_scan_id: string | null;
  recipe: Recipe;
  created_at: string;
}

function toDomain(row: Row): FavoriteRecipe {
  return {
    id: row.id,
    userId: row.user_id,
    sourceScanId: row.source_scan_id,
    recipe: row.recipe,
    createdAt: row.created_at,
  };
}

class SupabaseRecipeRepository implements RecipeRepository {
  async saveFavorite(
    userId: string,
    recipe: Recipe,
    sourceScanId?: string,
  ): Promise<FavoriteRecipe> {
    const { data, error } = await supabase
      .from("favorite_recipes")
      .insert({
        user_id: userId,
        source_scan_id: sourceScanId ?? null,
        recipe,
        title: recipe.title,
      })
      .select()
      .single<Row>();

    if (error || !data) throw new Error(`Failed to save favorite: ${error?.message}`);
    return toDomain(data);
  }

  async removeFavorite(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from("favorite_recipes")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) throw new Error(`Failed to remove favorite: ${error.message}`);
  }

  async listFavorites(userId: string): Promise<FavoriteRecipe[]> {
    const { data, error } = await supabase
      .from("favorite_recipes")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<Row[]>();

    if (error) throw new Error(`Failed to list favorites: ${error.message}`);
    return (data ?? []).map(toDomain);
  }
}

export const recipeRepository: RecipeRepository = new SupabaseRecipeRepository();
