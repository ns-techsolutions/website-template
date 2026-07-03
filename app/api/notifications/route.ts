import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { notificationService } from "@/features/admin/notifications/services/notification.service";

// Admin notification feed, derived on the fly from this salon's pending leave,
// unmoderated reviews and today's appointments.
export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await notificationService.list(workspaceId));
});
