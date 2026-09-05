import type { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, vi } from "vitest";
import { createPerUserRateLimit } from "./perUserRateLimit.js";

function makeReply() {
  return {
    header: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply & {
    header: ReturnType<typeof vi.fn>;
    code: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  };
}

function makeRequest(userId: string): FastifyRequest {
  return { userId } as FastifyRequest;
}

describe("createPerUserRateLimit", () => {
  it("allows up to max requests per user within the window", async () => {
    let now = 0;
    const limit = createPerUserRateLimit({ max: 2, windowMs: 1000, now: () => now });
    const reply = makeReply();

    await limit(makeRequest("u1"), reply);
    await limit(makeRequest("u1"), reply);

    expect(reply.code).not.toHaveBeenCalled();
  });

  it("blocks the request past max within the window with a 429 and Retry-After", async () => {
    let now = 0;
    const limit = createPerUserRateLimit({ max: 2, windowMs: 1000, now: () => now });
    const reply = makeReply();

    await limit(makeRequest("u1"), reply);
    await limit(makeRequest("u1"), reply);
    await limit(makeRequest("u1"), reply);

    expect(reply.code).toHaveBeenCalledWith(429);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: "rate_limited" }),
    );
    expect(reply.header).toHaveBeenCalledWith("Retry-After", expect.any(String));
  });

  it("resets the bucket once the window elapses", async () => {
    let now = 0;
    const limit = createPerUserRateLimit({ max: 1, windowMs: 1000, now: () => now });
    const reply = makeReply();

    await limit(makeRequest("u1"), reply);
    now = 1001;
    await limit(makeRequest("u1"), reply);

    expect(reply.code).not.toHaveBeenCalled();
  });

  it("tracks independent buckets per user", async () => {
    let now = 0;
    const limit = createPerUserRateLimit({ max: 1, windowMs: 1000, now: () => now });
    const reply = makeReply();

    await limit(makeRequest("u1"), reply);
    await limit(makeRequest("u2"), reply);

    expect(reply.code).not.toHaveBeenCalled();
  });
});
