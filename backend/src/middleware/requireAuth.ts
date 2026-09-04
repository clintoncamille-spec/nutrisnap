import type { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../repositories/supabase/client.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    reply.code(401).send({ error: "unauthorized", message: "Missing bearer token" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    reply.code(401).send({ error: "unauthorized", message: "Invalid or expired token" });
    return;
  }

  request.userId = data.user.id;
}
