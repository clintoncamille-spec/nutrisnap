import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { mealLogRepository, profileRepository } from "../repositories/index.js";

export async function summaryRoutes(app: FastifyInstance) {
  app.get("/api/summary", { onRequest: requireAuth }, async (request, reply) => {
    const query = request.query as { date?: string };
    const isoDate = query.date ?? new Date().toISOString().slice(0, 10);

    const [logs, profile] = await Promise.all([
      mealLogRepository.listForDate(request.userId, isoDate),
      profileRepository.get(request.userId),
    ]);

    const consumed = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.totalCalories,
        proteinG: acc.proteinG + log.totalProteinG,
        carbsG: acc.carbsG + log.totalCarbsG,
        fatG: acc.fatG + log.totalFatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );

    return reply.send({
      caloriesConsumed: consumed.calories,
      caloriesGoal: profile.dailyCalorieGoal,
      proteinG: consumed.proteinG,
      proteinGoalG: profile.dailyProteinGoalG,
      carbsG: consumed.carbsG,
      carbsGoalG: profile.dailyCarbsGoalG,
      fatG: consumed.fatG,
      fatGoalG: profile.dailyFatGoalG,
    });
  });
}
