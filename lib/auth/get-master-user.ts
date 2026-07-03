import type { NextRequest } from "next/server";

import { ForbiddenError, UnauthorizedError } from "@/lib/api/errors";
import { controlDb } from "@/lib/db/control";

import { extractBearer } from "./bearer";
import { verifyAccessToken } from "./jwt";
import type { AuthUser } from "./types";

/**
 * Resolves the signed-in platform super-admin from the bearer token, looking it
 * up in the CONTROL-PLANE database (master admins live there, never in a salon
 * database). Throws `UnauthorizedError` when the token is missing/invalid or
 * does not point at a master account.
 */
export async function getMasterUser(req: NextRequest): Promise<AuthUser> {
  const token = extractBearer(req);
  if (!token) throw new UnauthorizedError();

  let sub: string;
  try {
    const payload = await verifyAccessToken(token);
    if (payload.scope !== "admin") throw new UnauthorizedError();
    sub = payload.sub;
  } catch {
    throw new UnauthorizedError();
  }

  const admin = await controlDb.masterAdmin.findUnique({
    where: { id: sub },
    select: { id: true, name: true, email: true },
  });
  if (!admin) throw new UnauthorizedError();

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: null,
    role: "master",
    workspaceId: null,
  };
}

/** Like `getMasterUser` but returns `null` instead of throwing. */
export async function getOptionalMasterUser(
  req: NextRequest,
): Promise<AuthUser | null> {
  try {
    return await getMasterUser(req);
  } catch {
    return null;
  }
}

/** Requires the platform super-admin (`master`). */
export async function requireMaster(req: NextRequest): Promise<AuthUser> {
  const user = await getMasterUser(req);
  if (user.role !== "master") throw new ForbiddenError();
  return user;
}
