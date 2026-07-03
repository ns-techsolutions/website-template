import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { setRefreshCookie } from "@/lib/auth/refresh-cookie";
import { authService } from "@/features/auth/services/auth.service";

export const POST = withApi(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { refreshToken, ...result } = await authService.register(body);
  await setRefreshCookie("customer", refreshToken);
  return successJson(result, { status: 201, message: "Account created" });
});
