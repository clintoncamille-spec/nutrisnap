import type { FastifyReply, FastifyRequest } from "fastify";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Sliding-window-per-fixed-window limiter keyed on request.userId. Meant to
 * run as a preHandler (after requireAuth has populated userId) on specific
 * expensive routes, alongside the global IP-based @fastify/rate-limit
 * plugin registered in server.ts — the two are complementary, not
 * redundant: the global one bounds unauthenticated/IP-shared abuse, this
 * one bounds what a single authenticated user can do regardless of IP.
 */
export function createPerUserRateLimit(options: {
  max: number;
  windowMs: number;
  now?: () => number;
}) {
  const { max, windowMs, now = Date.now } = options;
  const buckets = new Map<string, Bucket>();

  return async function perUserRateLimit(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const time = now();
    const bucket = buckets.get(request.userId);

    if (!bucket || bucket.resetAt <= time) {
      buckets.set(request.userId, { count: 1, resetAt: time + windowMs });
      return;
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - time) / 1000);
      reply.header("Retry-After", String(retryAfterSeconds));
      reply.code(429).send({
        error: "rate_limited",
        message: "Too many requests — please slow down and try again shortly.",
      });
    }
  };
}
