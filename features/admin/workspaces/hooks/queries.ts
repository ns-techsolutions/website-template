"use client";

import { useQuery } from "@tanstack/react-query";

import { workspaceKeys } from "../queries/workspace.keys";
import { workspaceApi } from "../services/workspace-query.service";

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: () => workspaceApi.list(),
  });
}
