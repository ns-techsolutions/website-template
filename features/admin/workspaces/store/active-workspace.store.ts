"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ActiveWorkspaceState {
  /** The workspace the admin panel is currently operating on (null = server default). */
  activeId: string | null;
  setActive: (id: string | null) => void;
}

export const useActiveWorkspaceStore = create<ActiveWorkspaceState>()(
  persist(
    (set) => ({
      activeId: null,
      setActive: (activeId) => set({ activeId }),
    }),
    {
      name: "reine.admin.workspace",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Header bag attaching the master's selected salon to a CMS request. Honored
 * ONLY for master accounts (the server validates the token against the
 * control-plane and ignores the header otherwise), letting a master operate on
 * any salon's database from the platform console. Tenant admins and customers
 * are resolved purely from the request host, so this is harmless for them.
 */
export function workspaceHeaders(): Record<string, string> {
  const id = useActiveWorkspaceStore.getState().activeId;
  return id ? { "x-target-tenant": id } : {};
}
