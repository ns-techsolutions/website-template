import type { NextRequest } from "next/server";

import { ForbiddenError, UnauthorizedError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";
import { getOptionalMasterUser } from "./get-master-user";

import { extractBearer } from "./bearer";
import { verifyAccessToken, type AuthScope } from "./jwt";
import type { AuthUser } from "./types";

export type { AuthUser } from "./types";

/**
 * Verifies the bearer token (requiring the given `scope`) and resolves the user
 * from THIS request's salon database (resolved by host). A token minted for
 * salon A therefore fails on salon B's domain — its `sub` doesn't exist in B's
 * database — which is what enforces isolation at the auth layer. The `scope`
 * check additionally stops a customer token from acting on admin endpoints (and
 * vice-versa) even though both live in the same tenant DB as `User` rows.
 */
async function resolveTenantUser(
  req: NextRequest,
  scope: AuthScope,
): Promise<AuthUser> {
  const token = extractBearer(req);
  if (!token) throw new UnauthorizedError();

  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError();
  }
  if (payload.scope !== scope) throw new UnauthorizedError();

  const db = await getTenantDb();
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      workspaceId: true,
    },
  });
  if (!user) throw new UnauthorizedError();

  return user;
}

/** Resolves the signed-in customer (public site, `customer` scope). */
export async function getAuthUser(req: NextRequest): Promise<AuthUser> {
  return resolveTenantUser(req, "customer");
}

/** Like `getAuthUser` but returns `null` instead of throwing — for guest-allowed routes. */
export async function getOptionalAuthUser(
  req: NextRequest,
): Promise<AuthUser | null> {
  try {
    return await getAuthUser(req);
  } catch {
    return null;
  }
}

/**
 * Requires a panel user. Accepts either:
 *   - a platform `master` (control-plane), or
 *   - a salon `tenant` admin (this request's salon database).
 * Both authenticate with an `admin`-scope token. Customers and guests are
 * rejected. This is the authorization boundary for the admin/CMS routes.
 */
export async function requireStaff(req: NextRequest): Promise<AuthUser> {
  const master = await getOptionalMasterUser(req);
  if (master) return master;

  const user = await resolveTenantUser(req, "admin");
  if (user.role === "customer") throw new ForbiddenError();
  return user;
}
