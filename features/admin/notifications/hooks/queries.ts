"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { notificationKeys } from "../queries/notification.keys";
import { notificationApi } from "../services/notification-query.service";

export function useNotifications() {
  // `activeId` is null for tenant admins (resolved from host) and set only when a
  // master picks a salon. It's part of the key so switching salons refetches; we
  // deliberately don't gate on it, mirroring the other admin data hooks.
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...notificationKeys.lists(), workspaceId],
    queryFn: () => notificationApi.list(),
    // Derived from a heavy aggregation, so don't poll — React Query's refetch on
    // window focus (and on salon switch via the key) keeps it fresh enough.
    staleTime: 30_000,
  });
}
