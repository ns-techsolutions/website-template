"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { dashboardKeys } from "../queries/dashboard.keys";
import { dashboardApi } from "../services/dashboard-query.service";

export function useDashboard() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...dashboardKeys.summary(), workspaceId],
    queryFn: () => dashboardApi.get(),
  });
}
