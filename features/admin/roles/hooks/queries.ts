"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { roleKeys } from "../queries/role.keys";
import { roleApi } from "../services/role-query.service";

export function useRoles() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...roleKeys.lists(), workspaceId],
    queryFn: () => roleApi.list(),
  });
}
