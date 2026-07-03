"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { workspaceKeys } from "../queries/workspace.keys";
import { workspaceApi } from "../services/workspace-query.service";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validations/workspace.schema";

export function useCreateWorkspace() {
  return useAppMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspaceApi.create(input),
    invalidateKeys: [workspaceKeys.lists()],
    successMessage: "Workspace created",
  });
}

export function useUpdateWorkspace() {
  return useAppMutation({
    mutationFn: ({ id, ...input }: UpdateWorkspaceInput & { id: string }) =>
      workspaceApi.update(id, input),
    invalidateKeys: [workspaceKeys.lists()],
    successMessage: "Workspace updated",
  });
}

export function useUpdateWorkspaceDatabaseUrl() {
  return useAppMutation({
    mutationFn: ({ id, databaseUrl }: { id: string; databaseUrl: string }) =>
      workspaceApi.updateDatabaseUrl(id, databaseUrl),
    invalidateKeys: [workspaceKeys.lists()],
    successMessage: "Database URL updated",
  });
}
