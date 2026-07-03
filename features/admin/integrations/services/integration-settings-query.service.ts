"use client";

import { apiFetch } from "@/lib/api/client";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { IntegrationSettingsDto } from "../types/integration-settings.dto";
import type { UpdateIntegrationSettingsInput } from "../validations/integration-settings.schema";

export const integrationSettingsApi = {
  get: () =>
    apiFetch<IntegrationSettingsDto>("/api/integrations", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (body: UpdateIntegrationSettingsInput) =>
    apiFetch<IntegrationSettingsDto>("/api/integrations", {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
