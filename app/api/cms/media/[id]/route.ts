import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { mediaService } from "@/features/admin/cms-media/services/media.service";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const asset = await mediaService.remove(workspaceId, id);
  return successJson(asset, { message: "File deleted" });
});
