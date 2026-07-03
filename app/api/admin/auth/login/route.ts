import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { setRefreshCookie } from "@/lib/auth/refresh-cookie";
import { adminAuthService } from "@/features/admin/auth/services/admin-auth.service";

export const POST = withApi(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { refreshToken, ...result } = await adminAuthService.login(body, req);
  await setRefreshCookie("admin", refreshToken);
  return successJson(result, { message: "Signed in" });
});
