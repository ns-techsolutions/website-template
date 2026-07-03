"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { salonSettingsKeys } from "../queries/salon-settings.keys";
import { salonSettingsApi } from "../services/salon-settings-query.service";

export function useSalonSettings() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...salonSettingsKeys.detail(), workspaceId],
    queryFn: () => salonSettingsApi.get(),
  });
}
