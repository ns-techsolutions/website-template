"use client";

import { apiFetch } from "@/lib/api/client";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { SalonHours } from "../types";
import type { UpdateSalonHoursInput } from "../validations/opening-hours.schema";

export const openingHoursApi = {
  get: () =>
    apiFetch<SalonHours>("/api/opening-hours", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (body: UpdateSalonHoursInput) =>
    apiFetch<SalonHours>("/api/opening-hours", {
      method: "PUT",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
