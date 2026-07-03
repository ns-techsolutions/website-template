import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { serviceService } from "@/features/admin/services/services/service.service";

// Public: active services for this salon (resolved from the request host).
export const GET = withApi(async () => {
  const workspaceId = await getActiveWorkspaceId();
  return successJson(await serviceService.listActive(workspaceId));
});
