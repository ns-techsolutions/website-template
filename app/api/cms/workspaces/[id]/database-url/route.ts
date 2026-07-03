import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireMaster } from "@/lib/auth/get-master-user";
import { workspaceService } from "@/features/admin/workspaces/services/workspace.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requireMaster(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const workspace = await workspaceService.updateDatabaseUrl(id, body);
  return successJson(workspace, { message: "Database URL updated" });
});
