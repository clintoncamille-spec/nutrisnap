import { describe, expect, it } from "vitest";
import { isUserOwnedPath, validateCorsOrigin } from "./security.js";

const userId = "user-123";

describe("backend security helpers", () => {
  it("accepts only paths rooted in the authenticated user's directory", () => {
    expect(isUserOwnedPath(userId, `${userId}/photo.jpg`)).toBe(true);
    expect(isUserOwnedPath(userId, "other-user/photo.jpg")).toBe(false);
    expect(isUserOwnedPath(userId, `${userId}-suffix/photo.jpg`)).toBe(false);
    expect(isUserOwnedPath(userId, `${userId}/../other-user/photo.jpg`)).toBe(false);
  });

  it("rejects wildcard CORS in production", () => {
    expect(() => validateCorsOrigin("production", "*")).toThrow(
      "CORS_ORIGIN must be explicit in production",
    );
    expect(() => validateCorsOrigin("production", "https://app.example.com")).not.toThrow();
    expect(() => validateCorsOrigin("development", "*")).not.toThrow();
  });
});
