"use client";

import { apiFetch } from "@/lib/api/client";
import type { Role } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../validations/role.schema";

export const roleApi = {
  list: () =>
    apiFetch<Role[]>("/api/roles", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreateRoleInput) =>
    apiFetch<Role>("/api/roles", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateRoleInput) =>
    apiFetch<Role>(`/api/roles/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<Role>(`/api/roles/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
