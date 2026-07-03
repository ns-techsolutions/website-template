"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store";
import { customerKeys } from "../queries/customer.keys";
import { customerApi } from "../services/customer-query.service";

export function useCustomers() {
  const workspaceId = useActiveWorkspaceStore((s) => s.activeId);
  return useQuery({
    queryKey: [...customerKeys.lists(), workspaceId],
    queryFn: () => customerApi.list(),
  });
}
