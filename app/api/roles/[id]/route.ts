import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { roleService } from "@/features/admin/roles/services/role.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "roles.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const role = await roleService.update(workspaceId, id, body);
  return successJson(role, { message: "Role saved" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "roles.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const role = await roleService.remove(workspaceId, id);
  return successJson(role, { message: "Role deleted" });
});
