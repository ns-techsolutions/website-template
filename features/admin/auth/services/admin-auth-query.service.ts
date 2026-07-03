"use client";

import { apiFetch } from "@/lib/api/client";
import type { AuthResult } from "@/features/auth/types/auth.dto";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
} from "@/features/auth/types/auth.api";

/** Client-side fetchers for the admin auth endpoints (consumed by the hooks). */
export const adminAuthApi = {
  login: (body: LoginRequest) =>
    apiFetch<AuthResult>("/api/admin/auth/login", { method: "POST", body }),

  logout: () =>
    apiFetch<null>("/api/admin/auth/logout", { method: "POST" }),

  forgotPassword: (body: ForgotPasswordRequest) =>
    apiFetch<null>("/api/admin/auth/forgot-password", { method: "POST", body }),

  resetPassword: (body: ResetPasswordRequest) =>
    apiFetch<null>("/api/admin/auth/reset-password", { method: "POST", body }),
};
