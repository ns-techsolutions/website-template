"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { integrationSettingsKeys } from "../queries/integration-settings.keys";
import { integrationSettingsApi } from "../services/integration-settings-query.service";

export function useIntegrationSettings(opts?: { enabled?: boolean }) {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...integrationSettingsKeys.detail(), workspaceId],
    queryFn: () => integrationSettingsApi.get(),
    enabled: opts?.enabled ?? true,
  });
}
