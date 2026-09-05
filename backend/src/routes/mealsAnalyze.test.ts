import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, analyzeMealMock, scanCreateMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  analyzeMealMock: vi.fn(),
  scanCreateMock: vi.fn(),
}));

vi.mock("../repositories/supabase/client.js", () => ({
  supabase: { auth: { getUser: getUserMock } },
}));

vi.mock("../services/storage/supabaseStorage.js", async () => {
  const { isUserOwnedPath } = await import("../lib/security.js");
  return {
    imageStorage: {
      isOwnedByUser: isUserOwnedPath,
      getSignedUrl: vi.fn().mockResolvedValue("https://example.com/signed"),
      upload: vi.fn(),
      remove: vi.fn(),
    },
  };
});

vi.mock("../services/vision/index.js", async () => {
  const actual = await vi.importActual<typeof import("../services/vision/types.js")>(
    "../services/vision/types.js",
  );
  return {
    visionProvider: { analyzeMeal: analyzeMealMock, analyzeFridge: vi.fn() },
    recipeGenerator: { generateRecipes: vi.fn() },
    VisionProviderError: actual.VisionProviderError,
  };
});

vi.mock("../repositories/index.js", () => ({
  scanHistoryRepository: { create: scanCreateMock, getById: vi.fn(), listByUser: vi.fn() },
  mealLogRepository: {
    create: vi.fn(),
    listByUser: vi.fn(),
    getById: vi.fn(),
    listForDate: vi.fn(),
  },
  recipeRepository: { saveFavorite: vi.fn(), removeFavorite: vi.fn(), listFavorites: vi.fn() },
  profileRepository: { get: vi.fn(), update: vi.fn(), listAll: vi.fn() },
}));

function authAs(userId: string) {
  getUserMock.mockResolvedValue({ data: { user: { id: userId } }, error: null });
}

describe("POST /api/meals/analyze", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    getUserMock.mockReset();
    analyzeMealMock.mockReset();
    scanCreateMock.mockReset();

    analyzeMealMock.mockResolvedValue({
      isValidMealPhoto: true,
      items: [],
      totalCalories: 100,
      totalProteinG: 10,
      totalCarbsG: 10,
      totalFatG: 2,
      warnings: [],
    });
    scanCreateMock.mockImplementation(async (userId: string, scan: unknown) => ({
      id: "scan-1",
      userId,
      createdAt: new Date().toISOString(),
      ...(scan as object),
    }));

    const { buildServer } = await import("../server.js");
    app = await buildServer();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("rejects analyzing a photo owned by another user, without calling the vision provider", async () => {
    authAs("user-403");

    const res = await app.inject({
      method: "POST",
      url: "/api/meals/analyze",
      headers: { authorization: "Bearer token" },
      payload: { photoPath: "someone-else/photo.jpg" },
    });

    expect(res.statusCode).toBe(403);
    expect(analyzeMealMock).not.toHaveBeenCalled();
  });

  it("rate-limits a single user past the per-user analyze cap", async () => {
    authAs("user-ratelimit");

    const inject = () =>
      app.inject({
        method: "POST",
        url: "/api/meals/analyze",
        headers: { authorization: "Bearer token" },
        payload: { photoPath: "user-ratelimit/photo.jpg" },
      });

    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await inject()).statusCode);
    }

    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(statuses[10]).toBe(429);
  });
});
