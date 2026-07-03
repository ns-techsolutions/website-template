import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { ForbiddenError } from "@/lib/api/errors";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { authService } from "@/features/auth/services/auth.service";

/** Changes the signed-in tenant admin's own password. Admin-scope counterpart
 *  of `/api/auth/change-password`. */
export const POST = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  if (user.role === "master") {
    throw new ForbiddenError("Master password is managed in the platform console.");
  }
  const body = await req.json().catch(() => ({}));
  await authService.changePassword(user.id, body);
  return successJson(null, { message: "Password updated" });
});
