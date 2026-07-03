import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/require-permission";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { reviewService } from "@/features/admin/reviews/services/review.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "reviews.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const review = await reviewService.update(workspaceId, id, body);
  return successJson(review, { message: "Review saved" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requirePermission(req, "reviews.manage");
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const review = await reviewService.remove(workspaceId, id);
  return successJson(review, { message: "Review deleted" });
});
