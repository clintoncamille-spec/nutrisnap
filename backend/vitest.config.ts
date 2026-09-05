import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Dummy values so config/env.ts (parsed at module load) never fails a
    // test run for lack of real secrets — no live service is ever
    // contacted by the test suite. Mirrors the CI workflow's job-level env.
    env: {
      NODE_ENV: "test",
      OPENAI_API_KEY: "test-key",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
      CORS_ORIGIN: "http://localhost:5173",
      LOG_LEVEL: "silent",
    },
  },
});
