import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requireMaster } from "@/lib/auth/get-master-user";
import { workspaceService } from "@/features/admin/workspaces/services/workspace.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  return successJson(await workspaceService.listForUser(user));
});

export const POST = withApi(async (req: NextRequest) => {
  await requireMaster(req);
  const body = await req.json().catch(() => ({}));

  console.log("Received workspace creation request with body:", body); // Debug log
  const workspace = await workspaceService.create(body);
  return successJson(workspace, { status: 201, message: "Workspace created" });
});
