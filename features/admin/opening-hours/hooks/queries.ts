"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { openingHoursKeys } from "../queries/opening-hours.keys";
import { openingHoursApi } from "../services/opening-hours-query.service";

export function useOpeningHours() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...openingHoursKeys.detail(), workspaceId],
    queryFn: () => openingHoursApi.get(),
  });
}
