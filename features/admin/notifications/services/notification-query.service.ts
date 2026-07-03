"use client";

import { apiFetch } from "@/lib/api/client";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { NotificationDto } from "../types/notification.dto";

export const notificationApi = {
  list: () =>
    apiFetch<NotificationDto[]>("/api/notifications", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
