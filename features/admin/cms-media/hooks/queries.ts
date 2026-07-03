"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { mediaKeys } from "../queries/media.keys";
import { mediaApi } from "../services/media-query.service";

export function useMedia() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...mediaKeys.lists(), workspaceId],
    queryFn: () => mediaApi.list(),
  });
}
