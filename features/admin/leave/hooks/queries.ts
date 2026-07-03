"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { leaveKeys } from "../queries/leave.keys";
import { leaveApi } from "../services/leave-query.service";

export function useLeaveRequests() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...leaveKeys.lists(), workspaceId],
    queryFn: () => leaveApi.list(),
  });
}
