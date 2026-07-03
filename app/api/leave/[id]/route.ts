import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { leaveService } from "@/features/admin/leave/services/leave.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "leave.approve");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const leave = await leaveService.setStatus(workspaceId, id, body);
  return successJson(leave, { message: "Leave request updated" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "leave.approve");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const leave = await leaveService.remove(workspaceId, id);
  return successJson(leave, { message: "Leave request deleted" });
});
