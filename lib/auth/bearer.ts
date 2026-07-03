import type { NextRequest } from "next/server";

/** Extracts the raw token from an `Authorization: Bearer <jwt>` header. */
export function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}
