import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { profileRepository } from "../repositories/index.js";

// Minimal, read-only admin surface: list every user's profile (including
// role). There is no admin UI for this yet — it exists to have a real,
// gated endpoint to exercise requireAdmin against, and to grow from if an
// actual admin panel becomes a real feature later.
export async function adminRoutes(app: FastifyInstance) {
  app.get(
    "/api/admin/users",
    { onRequest: [requireAuth, requireAdmin] },
    async (_request, reply) => {
      return reply.send(await profileRepository.listAll());
    },
  );
}
