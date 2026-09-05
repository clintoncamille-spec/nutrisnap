import { z } from "zod";
import { validateCorsOrigin } from "../lib/security.js";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  VISION_PROVIDER: z.enum(["openai", "gemini"]).default("openai"),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_VISION_MODEL: z.string().default("gpt-4o"),
  GEMINI_API_KEY: z.string().optional(),

  DB_PROVIDER: z.enum(["supabase", "firebase"]).default("supabase"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().default("meal-photos"),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_MAX: z.coerce.number().default(30),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
  LOG_LEVEL: z.string().default("info"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  try {
    validateCorsOrigin(parsed.data.NODE_ENV, parsed.data.CORS_ORIGIN);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
