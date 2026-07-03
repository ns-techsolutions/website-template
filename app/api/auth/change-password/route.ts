import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { authService } from "@/features/auth/services/auth.service";

export const POST = withApi(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json().catch(() => ({}));
  await authService.changePassword(user.id, body);
  return successJson(null, { message: "Password updated" });
});
