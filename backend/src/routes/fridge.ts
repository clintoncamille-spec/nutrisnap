import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { analyzeRateLimit } from "../middleware/analyzeRateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { scanHistoryRepository } from "../repositories/index.js";
import { imageStorage } from "../services/storage/supabaseStorage.js";
import {
  VisionProviderError,
  recipeGenerator,
  visionProvider,
} from "../services/vision/index.js";

const analyzeBodySchema = z.object({ photoPath: z.string().min(1) });

export async function fridgeRoutes(app: FastifyInstance) {
  app.post(
    "/api/fridge/analyze",
    { onRequest: requireAuth, preHandler: analyzeRateLimit },
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
        const fridgeAnalysis = await visionProvider.analyzeFridge({
          url: signedUrl,
          mimeType: "image/jpeg",
        });
        const recipes = await recipeGenerator.generateRecipes(
          fridgeAnalysis.ingredients,
          { count: 3 },
        );

        const scan = await scanHistoryRepository.create(request.userId, {
          scanType: "fridge",
          photoPath: parsed.data.photoPath,
          rawAiResult: { ingredients: fridgeAnalysis.ingredients, recipes },
          aiProvider: "openai",
        });

        return reply.send({
          scanId: scan.id,
          photoPath: parsed.data.photoPath,
          photoSignedUrl: signedUrl,
          ingredientsDetected: fridgeAnalysis.ingredients,
          recipes,
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
}
