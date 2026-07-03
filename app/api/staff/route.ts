import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { staffService } from "@/features/admin/staff/services/staff.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await staffService.list(workspaceId));
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await requirePermission(req, "staff.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const member = await staffService.create(workspaceId, body);
  return successJson(member, { status: 201, message: "Staff member added" });
});
