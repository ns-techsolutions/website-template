"use client";

import { useQuery } from "@tanstack/react-query";

import { authKeys } from "../queries/auth.keys";
import { authApi } from "../services/auth-query.service";
import { useAuthStore } from "../store/auth.store";

/** Validates the stored token against the server; only runs when a token exists. */
export function useMe() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: !!token,
  });
}
