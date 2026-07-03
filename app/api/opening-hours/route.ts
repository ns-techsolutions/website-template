import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { openingHoursService } from "@/features/admin/opening-hours/services/opening-hours.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await openingHoursService.get(workspaceId));
});

export const PUT = withApi(async (req: NextRequest) => {
  const user = await requirePermission(req, "settings.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const hours = await openingHoursService.update(workspaceId, body);
  return successJson(hours, { message: "Opening hours saved" });
});
