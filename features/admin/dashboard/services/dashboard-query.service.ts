"use client";

import { apiFetch } from "@/lib/api/client";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { DashboardData } from "../types/dashboard.dto";

export const dashboardApi = {
  get: () =>
    apiFetch<DashboardData>("/api/dashboard", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
