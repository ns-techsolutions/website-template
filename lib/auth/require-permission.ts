import type { NextRequest } from "next/server";

import { ForbiddenError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";

import { requireStaff } from "./get-auth-user";
import type { AuthUser } from "./types";

/**
 * The permission keys a panel user is granted, or `"all"` for unrestricted
 * access. Resolution rules:
 *   - master           → "all" (platform super-admin)
 *   - tenant, no role  → "all" (back-compat: an unassigned admin keeps full access)
 *   - tenant, with role→ that role's permission keys
 */
export async function getUserPermissions(
  user: AuthUser,
): Promise<string[] | "all"> {
  // Master admins live in the control plane (not this salon's user table) and
  // always have full access — short-circuit before any tenant lookup.
  if (user.role === "master") return "all";

  const db = await getTenantDb();
  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { roleRef: { select: { permissions: true } } },
  });
  // No assigned role → unrestricted (preserves existing behaviour).
  if (!row?.roleRef) return "all";
  return row.roleRef.permissions;
}

/**
 * Like `requireStaff`, but additionally asserts the user holds `key`. Use on
 * mutating admin routes so a restricted role can read but not write. Master and
 * role-less tenant admins pass through (see `getUserPermissions`).
 */
export async function requirePermission(
  req: NextRequest,
  key: string,
): Promise<AuthUser> {
  const user = await requireStaff(req);
  const perms = await getUserPermissions(user);
  if (perms === "all") return user;
  if (!perms.includes(key)) {
    throw new ForbiddenError(`You don't have permission to ${key}.`);
  }
  return user;
}
