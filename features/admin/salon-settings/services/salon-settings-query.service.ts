"use client";

import { apiFetch } from "@/lib/api/client";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { SalonProfile } from "../types/salon-settings.dto";
import type { UpdateSalonSettingsInput } from "../validations/salon-settings.schema";

export const salonSettingsApi = {
  get: () =>
    apiFetch<SalonProfile>("/api/salon-settings", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (body: UpdateSalonSettingsInput) =>
    apiFetch<SalonProfile>("/api/salon-settings", {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
