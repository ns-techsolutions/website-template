"use client";

import { apiFetch } from "@/lib/api/client";
import type { Workspace } from "@/lib/admin/types";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validations/workspace.schema";

export const workspaceApi = {
  list: () =>
    apiFetch<Workspace[]>("/api/cms/workspaces", { method: "GET", auth: "admin" }),

  create: (body: CreateWorkspaceInput) =>
    apiFetch<Workspace>("/api/cms/workspaces", {
      method: "POST",
      body,
      auth: "admin",
    }),

  update: (id: string, body: UpdateWorkspaceInput) =>
    apiFetch<Workspace>(`/api/cms/workspaces/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
    }),

  updateDatabaseUrl: (id: string, databaseUrl: string) =>
    apiFetch<Workspace>(`/api/cms/workspaces/${id}/database-url`, {
      method: "PATCH",
      body: { databaseUrl },
      auth: "admin",
    }),
};
