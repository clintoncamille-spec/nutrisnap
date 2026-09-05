import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, removeMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("../repositories/supabase/client.js", () => ({
  supabase: { auth: { getUser: getUserMock } },
}));

vi.mock("../services/storage/supabaseStorage.js", async () => {
  const { isUserOwnedPath } = await import("../lib/security.js");
  return {
    imageStorage: {
      isOwnedByUser: isUserOwnedPath,
      remove: removeMock,
      upload: vi.fn(),
      getSignedUrl: vi.fn(),
    },
  };
});

describe("DELETE /api/uploads", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    getUserMock.mockReset();
    removeMock.mockReset();
    const { buildServer } = await import("../server.js");
    app = await buildServer();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("rejects requests without a bearer token", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/uploads",
      payload: { photoPath: "user-1/photo.jpg" },
    });

    expect(res.statusCode).toBe(401);
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("rejects deleting another user's photo", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const res = await app.inject({
      method: "DELETE",
      url: "/api/uploads",
      headers: { authorization: "Bearer valid-token" },
      payload: { photoPath: "user-2/photo.jpg" },
    });

    expect(res.statusCode).toBe(403);
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("deletes a photo owned by the authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    removeMock.mockResolvedValue(undefined);

    const res = await app.inject({
      method: "DELETE",
      url: "/api/uploads",
      headers: { authorization: "Bearer valid-token" },
      payload: { photoPath: "user-1/photo.jpg" },
    });

    expect(res.statusCode).toBe(204);
    expect(removeMock).toHaveBeenCalledWith("user-1/photo.jpg");
  });
});
