import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { adminAuthService } from "@/features/admin/auth/services/admin-auth.service";

export const POST = withApi(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  await adminAuthService.resetPassword(body);
  return successJson(null, { message: "Password reset — you can now sign in." });
});
