"use client";

import { apiFetch } from "@/lib/api/client";
import type { UserDto } from "@/features/auth/types/auth.dto";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/features/auth/types/auth.api";

/** Admin-scope account self-service (profile + password), separate from the
 *  customer `/api/auth/*` endpoints so the two sessions stay isolated. */
export const adminAccountApi = {
  updateProfile: (body: UpdateProfileRequest) =>
    apiFetch<UserDto>("/api/admin/auth/me", {
      method: "PATCH",
      body,
      auth: "admin",
    }),

  changePassword: (body: ChangePasswordRequest) =>
    apiFetch<null>("/api/admin/auth/change-password", {
      method: "POST",
      body,
      auth: "admin",
    }),
};
