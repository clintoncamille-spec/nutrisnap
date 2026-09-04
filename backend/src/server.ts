import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { MAX_UPLOAD_BYTES } from "./lib/imageLimits.js";
import { fridgeRoutes } from "./routes/fridge.js";
import { healthRoutes } from "./routes/health.js";
import { mealsRoutes } from "./routes/meals.js";
import { profileRoutes } from "./routes/profile.js";
import { recipesRoutes } from "./routes/recipes.js";
import { scansRoutes } from "./routes/scans.js";
import { summaryRoutes } from "./routes/summary.js";
import { uploadRoutes } from "./routes/uploads.js";

export async function buildServer() {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });

  await app.register(sensible);
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(multipart, {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  });
  // IP-based global limit as a baseline abuse guard. Per-user limits on the
  // expensive /analyze routes specifically (keyed on the authenticated
  // userId) are a documented follow-up — see project plan open items —
  // since @fastify/rate-limit's global onRequest hook runs before any
  // route-level auth hook populates request.userId.
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });

  await app.register(healthRoutes);
  await app.register(uploadRoutes);
  await app.register(mealsRoutes);
  await app.register(fridgeRoutes);
  await app.register(scansRoutes);
  await app.register(recipesRoutes);
  await app.register(summaryRoutes);
  await app.register(profileRoutes);

  return app;
}
