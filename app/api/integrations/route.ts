import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireMaster } from "@/lib/auth/get-master-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { integrationSettingsService } from "@/features/admin/integrations/services/integration-settings.service";

// Integrations (email + payment gateways) are a platform concern: only master
// admins may read or write them, targeting a salon via the workspace switcher.
export const GET = withApi(async (req: NextRequest) => {
  const user = await requireMaster(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await integrationSettingsService.getMasked(workspaceId));
});

export const PATCH = withApi(async (req: NextRequest) => {
  const user = await requireMaster(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const settings = await integrationSettingsService.update(workspaceId, body);
  return successJson(settings, { message: "Integrations saved" });
});
