import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { settingsService } from "@/features/admin/cms-appearance/services/settings.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await settingsService.get(workspaceId));
});

export const PUT = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const settings = await settingsService.update(workspaceId, body);
  return successJson(settings, { message: "Settings saved" });
});
