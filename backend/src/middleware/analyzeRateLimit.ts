import { env } from "../config/env.js";
import { createPerUserRateLimit } from "../lib/perUserRateLimit.js";

// Per-user limit on the expensive, OpenAI-calling /analyze routes. Must be
// registered as a preHandler (runs after requireAuth's onRequest hook has
// populated request.userId) — see the comment on rate-limit registration
// in server.ts for why the global plugin can't key on userId itself.
export const analyzeRateLimit = createPerUserRateLimit({
  max: env.ANALYZE_RATE_LIMIT_MAX,
  windowMs: env.ANALYZE_RATE_LIMIT_WINDOW_MS,
});
