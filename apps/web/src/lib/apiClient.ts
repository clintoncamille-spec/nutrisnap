import { NutriSnapApiClient } from "@nutrisnap/shared";
import { supabase } from "./supabase";

export const apiClient = new NutriSnapApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  getAuthToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },
});
