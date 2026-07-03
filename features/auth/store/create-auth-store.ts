"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserDto } from "../types/auth.dto";

export interface AuthState {
  user: UserDto | null;
  /** Short-lived access token (15m). The long-lived refresh token lives in an
   *  httpOnly cookie and is never readable here. */
  token: string | null;
  setAuth: (user: UserDto, token: string) => void;
  setUser: (user: UserDto) => void;
  updateUser: (partial: Partial<Omit<UserDto, "id">>) => void;
  clearAuth: () => void;
}

/**
 * Builds a persisted auth store under a dedicated localStorage key. The public
 * site and the admin panel each get their OWN store (different `persistName`)
 * so the two sessions never share state — an admin session can't show up as a
 * customer on the public site and vice-versa.
 *
 * Uses `skipHydration`: server and first client render both start signed-out,
 * then the store is rehydrated on mount (see AuthProvider / AdminGuard) to avoid
 * an SSR hydration mismatch.
 */
export function createAuthStore(persistName: string) {
  return create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        token: null,
        setAuth: (user, token) => set({ user, token }),
        setUser: (user) => set({ user }),
        updateUser: (partial) =>
          set((state) =>
            state.user ? { user: { ...state.user, ...partial } } : state,
          ),
        clearAuth: () => set({ user: null, token: null }),
      }),
      {
        name: persistName,
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
      },
    ),
  );
}
