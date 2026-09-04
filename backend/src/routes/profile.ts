import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { profileRepository } from "../repositories/index.js";

const updateProfileSchema = z.object({
  displayName: z.string().nullable().optional(),
  dailyCalorieGoal: z.number().positive().optional(),
  dailyProteinGoalG: z.number().positive().optional(),
  dailyCarbsGoalG: z.number().positive().optional(),
  dailyFatGoalG: z.number().positive().optional(),
});

export async function profileRoutes(app: FastifyInstance) {
  app.get("/api/profile", { onRequest: requireAuth }, async (request, reply) => {
    return reply.send(await profileRepository.get(request.userId));
  });

  app.patch("/api/profile", { onRequest: requireAuth }, async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "invalid_request", message: "Invalid profile payload" });
    }
    return reply.send(await profileRepository.update(request.userId, parsed.data));
  });
}
