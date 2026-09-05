import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { calculateMealTotals } from "../lib/security.js";
import { mealLogRepository, scanHistoryRepository } from "../repositories/index.js";
import { imageStorage } from "../services/storage/supabaseStorage.js";
import { VisionProviderError, visionProvider } from "../services/vision/index.js";

const analyzeBodySchema = z.object({ photoPath: z.string().min(1) });

const foodItemInputSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
  estimatedGrams: z.number().positive(),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
});

const createMealLogSchema = z.object({
  scanId: z.string(),
  photoPath: z.string(),
  items: z.array(foodItemInputSchema),
  totalCalories: z.number().nonnegative(),
  totalProteinG: z.number().nonnegative(),
  totalCarbsG: z.number().nonnegative(),
  totalFatG: z.number().nonnegative(),
  loggedAt: z.string(),
});

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/api/meals/analyze",
    { onRequest: requireAuth },
    async (request, reply) => {
      const parsed = analyzeBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply
          .code(400)
          .send({ error: "invalid_request", message: "photoPath is required" });
      }

      if (!imageStorage.isOwnedByUser(request.userId, parsed.data.photoPath)) {
        return reply.code(403).send({ error: "forbidden" });
      }

      const signedUrl = await imageStorage.getSignedUrl(parsed.data.photoPath);

      try {
        const analysis = await visionProvider.analyzeMeal({
          url: signedUrl,
          mimeType: "image/jpeg",
        });

        const scan = await scanHistoryRepository.create(request.userId, {
          scanType: "meal",
          photoPath: parsed.data.photoPath,
          rawAiResult: analysis,
          aiProvider: "openai",
        });

        const items = analysis.items.map((item) => ({
          id: crypto.randomUUID(),
          ...item,
        }));

        return reply.send({
          scanId: scan.id,
          photoPath: parsed.data.photoPath,
          photoSignedUrl: signedUrl,
          items,
          totalCalories: analysis.totalCalories,
          totalProteinG: analysis.totalProteinG,
          totalCarbsG: analysis.totalCarbsG,
          totalFatG: analysis.totalFatG,
          warnings: analysis.warnings,
        });
      } catch (err) {
        if (err instanceof VisionProviderError) {
          const status = err.code === "no_food_detected" ? 422 : 502;
          return reply.code(status).send({ error: err.code, message: err.message });
        }
        throw err;
      }
    },
  );

  app.post("/api/meals", { onRequest: requireAuth }, async (request, reply) => {
    const parsed = createMealLogSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "invalid_request", message: "Invalid meal log payload" });
    }

    const { scanId, ...log } = parsed.data;
    const scan = await scanHistoryRepository.getById(request.userId, scanId);
    if (!scan || scan.scanType !== "meal" || scan.photoPath !== log.photoPath) {
      return reply.code(400).send({
        error: "invalid_request",
        message: "Meal log must reference an owned meal scan",
      });
    }

    const totals = calculateMealTotals(log.items);
    const created = await mealLogRepository.create(request.userId, {
      ...log,
      scanHistoryId: scanId,
      totalCalories: totals.calories,
      totalProteinG: totals.proteinG,
      totalCarbsG: totals.carbsG,
      totalFatG: totals.fatG,
    });

    return reply.code(201).send(created);
  });

  app.get("/api/meals", { onRequest: requireAuth }, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string };
    const { items, nextCursor } = await mealLogRepository.listByUser(
      request.userId,
      { cursor: query.cursor, limit: query.limit ? Number(query.limit) : undefined },
    );
    return reply.send({ items, nextCursor });
  });

  app.get("/api/meals/:id", { onRequest: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const log = await mealLogRepository.getById(request.userId, id);
    if (!log) return reply.code(404).send({ error: "not_found" });
    return reply.send(log);
  });
}
