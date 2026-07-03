import type { NextRequest } from "next/server";

import { NotFoundError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";
import type { AuthUser } from "./types";

/**
 * The workspace this request operates on. In the database-per-tenant model each
 * salon's database holds exactly one workspace, so we simply return it. The
 * request is already pinned to a single salon database (by host, or by the
 * master `x-target-tenant` override), which is the real isolation boundary —
 * `req`/`user` are accepted only for call-site compatibility and unused.
 */
export async function getActiveWorkspaceId(
  _req?: NextRequest,
  _user?: AuthUser,
): Promise<string> {
  const db = await getTenantDb();
  const ws = await db.workspace.findFirst({ select: { id: true } });
  if (!ws) throw new NotFoundError("This salon's database has no workspace.");
  return ws.id;
}
