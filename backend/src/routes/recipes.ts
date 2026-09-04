import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { recipeRepository } from "../repositories/index.js";

const recipeSchema = z.object({
  title: z.string(),
  prepTimeMinutes: z.number(),
  cookTimeMinutes: z.number(),
  servings: z.number(),
  ingredientsUsed: z.array(
    z.object({ name: z.string(), quantity: z.string(), fromPhoto: z.boolean() }),
  ),
  pantryStaplesUsed: z.array(z.string()),
  steps: z.array(z.string()),
  nutritionPerServing: z.object({
    calories: z.number(),
    proteinG: z.number(),
    carbsG: z.number(),
    fatG: z.number(),
  }),
});

const favoriteBodySchema = z.object({
  recipe: recipeSchema,
  sourceScanId: z.string().optional(),
});

export async function recipesRoutes(app: FastifyInstance) {
  app.post(
    "/api/recipes/favorite",
    { onRequest: requireAuth },
    async (request, reply) => {
      const parsed = favoriteBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_request", message: "Invalid recipe payload" });
      }
      const favorite = await recipeRepository.saveFavorite(
        request.userId,
        parsed.data.recipe,
        parsed.data.sourceScanId,
      );
      return reply.code(201).send(favorite);
    },
  );

  app.get(
    "/api/recipes/favorites",
    { onRequest: requireAuth },
    async (request, reply) => {
      const favorites = await recipeRepository.listFavorites(request.userId);
      return reply.send(favorites);
    },
  );

  app.delete(
    "/api/recipes/favorites/:id",
    { onRequest: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await recipeRepository.removeFavorite(request.userId, id);
      return reply.code(204).send();
    },
  );
}
