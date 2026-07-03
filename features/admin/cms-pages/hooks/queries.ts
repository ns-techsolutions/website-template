"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { pageKeys } from "../queries/page.keys";
import { pageApi } from "../services/page-query.service";

export function usePages() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...pageKeys.lists(), workspaceId],
    queryFn: () => pageApi.list(),
  });
}

export function usePage(id: string | undefined) {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...pageKeys.detail(id ?? ""), workspaceId],
    queryFn: () => pageApi.get(id as string),
    enabled: !!id,
  });
}
