import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { salonSettingsService } from "@/features/admin/salon-settings/services/salon-settings.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await salonSettingsService.get(workspaceId));
});

export const PATCH = withApi(async (req: NextRequest) => {
  const user = await requirePermission(req, "settings.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const profile = await salonSettingsService.update(workspaceId, body);
  return successJson(profile, { message: "Settings saved" });
});
