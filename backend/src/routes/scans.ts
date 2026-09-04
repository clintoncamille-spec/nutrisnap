import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { scanHistoryRepository } from "../repositories/index.js";

export async function scansRoutes(app: FastifyInstance) {
  app.get("/api/scans", { onRequest: requireAuth }, async (request, reply) => {
    const query = request.query as { type?: "meal" | "fridge" };
    const scans = await scanHistoryRepository.listByUser(request.userId, {
      type: query.type,
    });
    return reply.send(scans);
  });
}
