"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { settingsKeys } from "../queries/settings.keys";
import { settingsApi } from "../services/settings-query.service";

export function useSettings() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...settingsKeys.detail(), workspaceId],
    queryFn: () => settingsApi.get(),
  });
}
