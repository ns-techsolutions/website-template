import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/api/errors";
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from "@/lib/auth/refresh-cookie";
import { adminAuthService } from "@/features/admin/auth/services/admin-auth.service";

/** Silently renews the admin session (master or tenant admin) from the cookie. */
export const POST = withApi(async (req: NextRequest) => {
  const rawToken = await readRefreshCookie("admin");
  if (!rawToken) throw new UnauthorizedError();

  try {
    const { refreshToken, ...result } = await adminAuthService.refresh(
      rawToken,
      req,
    );
    await setRefreshCookie("admin", refreshToken);
    return successJson(result, { message: "Refreshed" });
  } catch (err) {
    await clearRefreshCookie("admin");
    throw err;
  }
});
