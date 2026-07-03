import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { reviewService } from "@/features/admin/reviews/services/review.service";

// Customer: the signed-in customer's own reviews (keyed by booking), so the
// account page can show which past bookings have already been reviewed.
export const GET = withApi(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const workspaceId = await getActiveWorkspaceId();
  return successJson(await reviewService.listForCustomer(workspaceId, user.id));
});
