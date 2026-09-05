import type { FastifyReply, FastifyRequest } from "fastify";
import { profileRepository } from "../repositories/index.js";

// Must run after requireAuth — it depends on request.userId already being
// populated. Register both, in order, on any route this guards:
//   { onRequest: [requireAuth, requireAdmin] }
//
// Looks up the caller's own profile and checks profiles.role. This is the
// only place that column is ever read for authorization; it can only be
// set via direct DB access or scripts/create-test-user.ts, never through
// PATCH /api/profile (see the note on ProfileRepository.update).
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const profile = await profileRepository.get(request.userId);
  if (profile.role !== "admin") {
    reply.code(403).send({ error: "forbidden", message: "Admin access required" });
  }
}
