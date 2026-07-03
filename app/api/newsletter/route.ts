import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { newsletterService } from "@/features/newsletter/services/newsletter.service";

// Public: newsletter signup (resolved to the salon by host).
export const POST = withApi(async (req: NextRequest) => {
  const workspaceId = await getActiveWorkspaceId();
  const body = await req.json().catch(() => ({}));
  await newsletterService.subscribe(workspaceId, body);
  return successJson(null, { status: 201, message: "Subscribed" });
});
