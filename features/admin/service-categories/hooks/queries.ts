"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { serviceCategoryKeys } from "../queries/service-category.keys";
import { serviceCategoryApi } from "../services/service-category-query.service";

export function useServiceCategories() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...serviceCategoryKeys.lists(), workspaceId],
    queryFn: () => serviceCategoryApi.list(),
  });
}
