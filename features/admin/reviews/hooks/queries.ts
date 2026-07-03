"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { reviewKeys } from "../queries/review.keys";
import { reviewApi } from "../services/review-query.service";

export function useReviews() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...reviewKeys.lists(), workspaceId],
    queryFn: () => reviewApi.list(),
  });
}
