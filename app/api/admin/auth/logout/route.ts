import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { clearRefreshCookie, readRefreshCookie } from "@/lib/auth/refresh-cookie";
import { adminAuthService } from "@/features/admin/auth/services/admin-auth.service";

/** Revokes the admin refresh token and clears its cookie. */
export const POST = withApi(async (req: NextRequest) => {
  const rawToken = await readRefreshCookie("admin");
  await adminAuthService.logout(rawToken, req);
  await clearRefreshCookie("admin");
  return successJson(null, { message: "Signed out" });
});
