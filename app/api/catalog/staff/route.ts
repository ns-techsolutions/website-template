import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { staffService } from "@/features/admin/staff/services/staff.service";

// Public: active staff for this salon (resolved from the request host).
export const GET = withApi(async () => {
  const workspaceId = await getActiveWorkspaceId();
  return successJson(await staffService.listActive(workspaceId));
});
