"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { serviceKeys } from "../queries/service.keys";
import { serviceApi } from "../services/service-query.service";

export function useServices(categoryId?: string) {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...serviceKeys.list(categoryId), workspaceId],
    queryFn: () => serviceApi.list(categoryId),
  });
}
