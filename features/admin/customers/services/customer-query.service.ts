"use client";

import { apiFetch } from "@/lib/api/client";
import type { Customer } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../validations/customer.schema";

export const customerApi = {
  list: (q?: string) =>
    apiFetch<Customer[]>("/api/customers", {
      method: "GET",
      auth: "admin",
      query: { q },
      headers: workspaceHeaders(),
    }),

  get: (id: string) =>
    apiFetch<Customer>(`/api/customers/${id}`, {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreateCustomerInput) =>
    apiFetch<Customer>("/api/customers", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateCustomerInput) =>
    apiFetch<Customer>(`/api/customers/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
