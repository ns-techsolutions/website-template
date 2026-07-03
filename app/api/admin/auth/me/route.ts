import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { ForbiddenError } from "@/lib/api/errors";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { authService } from "@/features/auth/services/auth.service";

/** Current panel user. Admin-scope counterpart of `/api/auth/me`. */
export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  return successJson(user);
});

/** Updates the signed-in tenant admin's own profile. */
export const PATCH = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  // Master accounts live in the control plane, not a salon DB — their profile is
  // managed from the platform console, not here.
  if (user.role === "master") {
    throw new ForbiddenError("Master profile is managed in the platform console.");
  }
  const body = await req.json().catch(() => ({}));
  const updated = await authService.updateProfile(user.id, body);
  return successJson(updated, { message: "Profile updated" });
});
