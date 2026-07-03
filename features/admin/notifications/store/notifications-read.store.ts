"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Tracks which derived notifications the admin has already seen. Notifications
 * themselves aren't persisted server-side, so "read" state lives here, in the
 * browser. Keyed per workspace so a master switching salons (or two tenants
 * sharing a device) never inherit each other's read state. Tenant admins have no
 * active salon id and fall back to the {@link DEFAULT_KEY} bucket.
 */

export const DEFAULT_KEY = "default";

interface NotificationsReadState {
  /** workspace key → ids the user has marked read. */
  readByWorkspace: Record<string, string[]>;
  markRead: (workspaceKey: string, id: string) => void;
  markAllRead: (workspaceKey: string, ids: string[]) => void;
}

export const useNotificationsReadStore = create<NotificationsReadState>()(
  persist(
    (set) => ({
      readByWorkspace: {},
      markRead: (workspaceKey, id) =>
        set((state) => {
          const current = state.readByWorkspace[workspaceKey] ?? [];
          if (current.includes(id)) return state;
          return {
            readByWorkspace: {
              ...state.readByWorkspace,
              [workspaceKey]: [...current, id],
            },
          };
        }),
      markAllRead: (workspaceKey, ids) =>
        set((state) => {
          const current = state.readByWorkspace[workspaceKey] ?? [];
          const merged = Array.from(new Set([...current, ...ids]));
          return {
            readByWorkspace: {
              ...state.readByWorkspace,
              [workspaceKey]: merged,
            },
          };
        }),
    }),
    {
      name: "reine.admin.notifications.read",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
