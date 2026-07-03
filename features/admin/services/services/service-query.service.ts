"use client";

import { apiFetch } from "@/lib/api/client";
import type { Service } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "../validations/service.schema";

export const serviceApi = {
  list: (categoryId?: string) =>
    apiFetch<Service[]>("/api/services", {
      method: "GET",
      auth: "admin",
      query: { categoryId },
      headers: workspaceHeaders(),
    }),

  create: (body: CreateServiceInput) =>
    apiFetch<Service>("/api/services", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateServiceInput) =>
    apiFetch<Service>(`/api/services/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<Service>(`/api/services/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
