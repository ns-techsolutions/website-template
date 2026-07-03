import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { serviceService } from "@/features/admin/services/services/service.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  return successJson(await serviceService.get(workspaceId, id));
});

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "services.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const service = await serviceService.update(workspaceId, id, body);
  return successJson(service, { message: "Service saved" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "services.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const service = await serviceService.remove(workspaceId, id);
  return successJson(service, { message: "Service deleted" });
});
