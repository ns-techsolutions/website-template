"use client";

import { apiFetch } from "@/lib/api/client";
import type { LeaveRequest, LeaveStatus } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { NewLeaveRequest } from "../types/leave.api";

export const leaveApi = {
  list: (status?: LeaveStatus) =>
    apiFetch<LeaveRequest[]>("/api/leave", {
      method: "GET",
      auth: "admin",
      query: { status },
      headers: workspaceHeaders(),
    }),

  create: (body: NewLeaveRequest) =>
    apiFetch<LeaveRequest>("/api/leave", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  setStatus: (id: string, status: LeaveStatus) =>
    apiFetch<LeaveRequest>(`/api/leave/${id}`, {
      method: "PATCH",
      body: { status },
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<LeaveRequest>(`/api/leave/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
