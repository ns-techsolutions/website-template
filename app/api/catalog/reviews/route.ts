import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { reviewService } from "@/features/admin/reviews/services/review.service";

// Public: published reviews for this salon (resolved from the request host).
export const GET = withApi(async () => {
  const workspaceId = await getActiveWorkspaceId();
  return successJson(await reviewService.listPublished(workspaceId));
});

// Customer: submit a review for one of your own completed bookings. Stored
// unpublished — it enters the admin moderation queue before going live.
export const POST = withApi(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const workspaceId = await getActiveWorkspaceId();
  const body = await req.json().catch(() => ({}));
  const review = await reviewService.submitForCustomer(workspaceId, user.id, body);
  return successJson(review, {
    status: 201,
    message: "Thanks for your review!",
  });
});
