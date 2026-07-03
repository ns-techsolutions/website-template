"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { authKeys } from "../queries/auth.keys";
import { authApi } from "../services/auth-query.service";
import { useAuthStore } from "../store/auth.store";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "../types/auth.api";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useAppMutation({
    mutationFn: (input: LoginRequest) => authApi.login(input),
    invalidateKeys: [authKeys.all],
    successMessage: "Welcome back",
    onSuccess: (result) => {
      setAuth(result.user, result.token);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useAppMutation({
    mutationFn: (input: RegisterRequest) => authApi.register(input),
    invalidateKeys: [authKeys.all],
    successMessage: "Account created",
    onSuccess: (result) => {
      setAuth(result.user, result.token);
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useAppMutation({
    mutationFn: (input: UpdateProfileRequest) => authApi.updateProfile(input),
    invalidateKeys: [authKeys.all],
    successMessage: "Profile updated",
    onSuccess: (user) => {
      setUser(user);
    },
  });
}

export function useChangePassword() {
  return useAppMutation({
    mutationFn: (input: ChangePasswordRequest) => authApi.changePassword(input),
    successMessage: "Password changed",
  });
}

export function useForgotPassword() {
  return useAppMutation({
    mutationFn: (input: ForgotPasswordRequest) => authApi.forgotPassword(input),
    successMessage: "Reset link sent",
  });
}

export function useResetPassword() {
  return useAppMutation({
    mutationFn: (input: ResetPasswordRequest) => authApi.resetPassword(input),
    successMessage: "Password updated",
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return async () => {
    try {
      // Revoke the refresh token + clear its httpOnly cookie server-side.
      await authApi.logout();
    } catch {
      // Best-effort — clear locally even if the network call fails.
    }
    clearAuth();
    queryClient.clear();
  };
}
