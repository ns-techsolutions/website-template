import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { authService } from "@/features/auth/services/auth.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  return successJson(user);
});

export const PATCH = withApi(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json().catch(() => ({}));
  const updated = await authService.updateProfile(user.id, body);
  return successJson(updated, { message: "Profile updated" });
});
