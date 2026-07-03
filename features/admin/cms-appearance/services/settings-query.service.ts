"use client";

import { apiFetch } from "@/lib/api/client";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { SettingsDto } from "../types/settings.dto";
import type { UpdateSettingsInput } from "../validations/settings.schema";

export const settingsApi = {
  get: () =>
    apiFetch<SettingsDto>("/api/cms/settings", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (body: UpdateSettingsInput) =>
    apiFetch<SettingsDto>("/api/cms/settings", {
      method: "PUT",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
