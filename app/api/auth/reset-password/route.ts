import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { authService } from "@/features/auth/services/auth.service";

export const POST = withApi(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  await authService.resetPassword(body);
  return successJson(null, { message: "Password reset — you can now sign in." });
});
