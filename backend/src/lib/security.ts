export function isUserOwnedPath(userId: string, path: string): boolean {
  const segments = path.split("/");
  return segments.length > 1 && segments[0] === userId && !segments.includes("..");
}

export function validateCorsOrigin(
  nodeEnv: "development" | "production" | "test",
  corsOrigin: string,
): void {
  if (nodeEnv === "production" && corsOrigin === "*") {
    throw new Error("CORS_ORIGIN must be explicit in production");
  }
}
