import { createClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js";

// Server-side client using the service_role key — bypasses RLS. Every
// repository method below must be called with an explicitly-scoped
// userId (extracted from the verified JWT in middleware/requireAuth.ts)
// and must filter every query by it; RLS remains a second line of
// defense in case a client ever queries Supabase directly.
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
