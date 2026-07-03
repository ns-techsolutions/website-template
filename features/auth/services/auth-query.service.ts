"use client";

import { apiFetch } from "@/lib/api/client";
import type { AuthResult, UserDto } from "../types/auth.dto";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "../types/auth.api";

/** Client-side fetchers for the auth endpoints (consumed by the hooks). */
export const authApi = {
  register: (body: RegisterRequest) =>
    apiFetch<AuthResult>("/api/auth/register", { method: "POST", body }),

  login: (body: LoginRequest) =>
    apiFetch<AuthResult>("/api/auth/login", { method: "POST", body }),

  logout: () => apiFetch<null>("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch<UserDto>("/api/auth/me", { method: "GET", auth: true }),

  updateProfile: (body: UpdateProfileRequest) =>
    apiFetch<UserDto>("/api/auth/me", { method: "PATCH", body, auth: true }),

  changePassword: (body: ChangePasswordRequest) =>
    apiFetch<null>("/api/auth/change-password", {
      method: "POST",
      body,
      auth: true,
    }),

  forgotPassword: (body: ForgotPasswordRequest) =>
    apiFetch<null>("/api/auth/forgot-password", { method: "POST", body }),

  resetPassword: (body: ResetPasswordRequest) =>
    apiFetch<null>("/api/auth/reset-password", { method: "POST", body }),
};
