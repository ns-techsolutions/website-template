"use client";

import { apiFetch } from "@/lib/api/client";
import type { ServiceCategory } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from "../validations/service-category.schema";

export const serviceCategoryApi = {
  list: () =>
    apiFetch<ServiceCategory[]>("/api/service-categories", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreateServiceCategoryInput) =>
    apiFetch<ServiceCategory>("/api/service-categories", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateServiceCategoryInput) =>
    apiFetch<ServiceCategory>(`/api/service-categories/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<ServiceCategory>(`/api/service-categories/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
