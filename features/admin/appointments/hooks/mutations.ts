"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { appointmentKeys } from "../queries/appointment.keys";
import { appointmentApi } from "../services/appointment-query.service";
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment.api";

export function useCreateAppointment() {
  return useAppMutation({
    mutationFn: (input: CreateAppointmentRequest) =>
      appointmentApi.create(input),
    invalidateKeys: [appointmentKeys.lists()],
    successMessage: "Appointment created",
  });
}

export function useUpdateAppointment() {
  return useAppMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAppointmentRequest;
    }) => appointmentApi.update(id, input),
    invalidateKeys: [appointmentKeys.lists()],
    successMessage: "Appointment updated",
  });
}

export function useDeleteAppointment() {
  return useAppMutation({
    mutationFn: (id: string) => appointmentApi.remove(id),
    invalidateKeys: [appointmentKeys.lists()],
    successMessage: "Appointment deleted",
  });
}

export function useRefundAppointment() {
  return useAppMutation({
    mutationFn: (id: string) => appointmentApi.refund(id),
    invalidateKeys: [appointmentKeys.lists()],
    successMessage: "Deposit refunded",
  });
}
