import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { publicOrigin } from "@/lib/net/request-origin";
import { authService } from "@/features/auth/services/auth.service";

export const POST = withApi(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  await authService.requestPasswordReset(body, publicOrigin(req));
  // Generic response — never reveal whether the email is registered.
  return successJson(null, {
    message: "If that email is registered, a reset link is on its way.",
  });
});
