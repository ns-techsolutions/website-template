import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { serviceService } from "@/features/admin/services/services/service.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const categoryId =
    req.nextUrl.searchParams.get("categoryId")?.trim() || undefined;
  return successJson(await serviceService.list(workspaceId, categoryId));
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await requirePermission(req, "services.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const service = await serviceService.create(workspaceId, body);
  return successJson(service, { status: 201, message: "Service created" });
});
