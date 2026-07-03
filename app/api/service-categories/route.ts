import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { serviceCategoryService } from "@/features/admin/service-categories/services/service-category.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await serviceCategoryService.list(workspaceId));
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await requirePermission(req, "services.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const category = await serviceCategoryService.create(workspaceId, body);
  return successJson(category, { status: 201, message: "Category created" });
});
