import { cookies } from "next/headers";

import type { AuthScope } from "./jwt";
import { refreshTtlMs } from "./refresh-ttl";

/**
 * The refresh token lives in an httpOnly, **path-scoped** cookie — distinct name
 * and path per scope — so the customer and admin sessions can never read or
 * clobber each other:
 *   - customer cookie is only sent to `/api/auth/*`
 *   - admin cookie is only sent to `/api/admin/auth/*`
 * The client JS never reads these (httpOnly); only the refresh/logout routes do.
 */
const COOKIE_NAME: Record<AuthScope, string> = {
  customer: "reine.rt.customer",
  admin: "reine.rt.admin",
};

const COOKIE_PATH: Record<AuthScope, string> = {
  customer: "/api/auth",
  admin: "/api/admin/auth",
};

/** Sets the httpOnly refresh cookie for the given scope. */
export async function setRefreshCookie(
  scope: AuthScope,
  rawToken: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME[scope], rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: COOKIE_PATH[scope],
    maxAge: Math.floor(refreshTtlMs() / 1000),
  });
}

/** Clears the refresh cookie for the given scope (must match the set path). */
export async function clearRefreshCookie(scope: AuthScope): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME[scope], "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: COOKIE_PATH[scope],
    maxAge: 0,
  });
}

/** Reads the raw refresh token from the scope's cookie, or null if absent. */
export async function readRefreshCookie(
  scope: AuthScope,
): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME[scope])?.value ?? null;
}
