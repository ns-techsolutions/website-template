"use client";

import { apiFetch } from "@/lib/api/client";
import type { Service, StaffMember } from "@/lib/admin/types";
import type { SalonHours } from "@/features/admin/opening-hours/types";

/** Public (unauthenticated) reads — the salon is resolved from the request host. */
export const catalogApi = {
  services: () =>
    apiFetch<Service[]>("/api/catalog/services", { method: "GET" }),

  staff: () => apiFetch<StaffMember[]>("/api/catalog/staff", { method: "GET" }),

  hours: () =>
    apiFetch<SalonHours>("/api/catalog/opening-hours", { method: "GET" }),

  availability: (date: string, serviceId?: string, staffId?: string) =>
    apiFetch<string[]>("/api/catalog/availability", {
      method: "GET",
      query: { date, serviceId, staffId },
    }),
};
