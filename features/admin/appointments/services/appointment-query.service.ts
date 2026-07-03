"use client";

import { apiFetch } from "@/lib/api/client";
import type { Appointment } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment.api";

export const appointmentApi = {
  list: () =>
    apiFetch<Appointment[]>("/api/appointments", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreateAppointmentRequest) =>
    apiFetch<Appointment>("/api/appointments", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateAppointmentRequest) =>
    apiFetch<Appointment>(`/api/appointments/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<Appointment>(`/api/appointments/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  refund: (id: string) =>
    apiFetch<Appointment>(`/api/appointments/${id}/refund`, {
      method: "POST",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
