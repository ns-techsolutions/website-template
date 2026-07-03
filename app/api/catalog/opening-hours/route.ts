import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { openingHoursService } from "@/features/admin/opening-hours/services/opening-hours.service";

// Public: the salon's opening hours + slot length.
export const GET = withApi(async () => {
  const workspaceId = await getActiveWorkspaceId();
  return successJson(await openingHoursService.get(workspaceId));
});
