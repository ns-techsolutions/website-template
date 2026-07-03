import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { staffService } from "@/features/admin/staff/services/staff.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  return successJson(await staffService.get(workspaceId, id));
});

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "staff.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const member = await staffService.update(workspaceId, id, body);
  return successJson(member, { message: "Staff member saved" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "staff.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const member = await staffService.remove(workspaceId, id);
  return successJson(member, { message: "Staff member removed" });
});
