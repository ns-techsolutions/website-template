"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "@/features/auth/types/auth.api";

import { adminAuthApi } from "../services/admin-auth-query.service";
import { adminAccountApi } from "../services/admin-account-query.service";

/** Signs a master/tenant user into the admin panel and stores the session. */
export function useAdminLogin() {
  const setAuth = useAdminAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (input: LoginRequest) => adminAuthApi.login(input),
    successMessage: "Welcome back",
    onSuccess: (result) => {
      setAuth(result.user, result.token);
      // Drop any cached data from a previous session.
      queryClient.clear();
    },
  });
}

/** Signs the admin out: revokes the refresh token server-side, then clears local state. */
export function useAdminLogout() {
  const clearAuth = useAdminAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return async () => {
    try {
      await adminAuthApi.logout();
    } catch {
      // Best-effort — clear locally even if the network call fails.
    }
    clearAuth();
    queryClient.clear();
  };
}

/** Updates the signed-in admin's profile (admin-scope endpoint + store). */
export function useAdminUpdateProfile() {
  const setUser = useAdminAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (input: UpdateProfileRequest) =>
      adminAccountApi.updateProfile(input),
    successMessage: "Profile updated",
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries();
    },
  });
}

/** Changes the signed-in admin's password (admin-scope endpoint). */
export function useAdminChangePassword() {
  return useAppMutation({
    mutationFn: (input: ChangePasswordRequest) =>
      adminAccountApi.changePassword(input),
    successMessage: "Password changed",
  });
}

/** Requests a password-reset link for a salon admin (no toast — the view shows its own confirmation). */
export function useAdminForgotPassword() {
  return useAppMutation({
    mutationFn: (input: ForgotPasswordRequest) =>
      adminAuthApi.forgotPassword(input),
    showSuccessToast: false,
  });
}

/** Sets a new password from a reset token (no toast — the view navigates to sign in). */
export function useAdminResetPassword() {
  return useAppMutation({
    mutationFn: (input: ResetPasswordRequest) =>
      adminAuthApi.resetPassword(input),
    showSuccessToast: false,
  });
}
