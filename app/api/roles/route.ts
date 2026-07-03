import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { roleService } from "@/features/admin/roles/services/role.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await roleService.list(workspaceId));
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await requirePermission(req, "roles.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const role = await roleService.create(workspaceId, body);
  return successJson(role, { status: 201, message: "Role created" });
});
