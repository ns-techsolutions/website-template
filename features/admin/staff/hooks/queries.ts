"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { staffKeys } from "../queries/staff.keys";
import { staffApi } from "../services/staff-query.service";

export function useStaff() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...staffKeys.lists(), workspaceId],
    queryFn: () => staffApi.list(),
  });
}
