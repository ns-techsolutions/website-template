"use client";

import { apiFetch } from "@/lib/api/client";
import type { StaffMember } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../validations/staff.schema";

export const staffApi = {
  list: () =>
    apiFetch<StaffMember[]>("/api/staff", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreateStaffInput) =>
    apiFetch<StaffMember>("/api/staff", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateStaffInput) =>
    apiFetch<StaffMember>(`/api/staff/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<StaffMember>(`/api/staff/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
