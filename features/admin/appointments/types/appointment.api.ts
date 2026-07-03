import type { AppointmentStatus } from "@/lib/admin/types";

/** Client → server payloads (dates travel as "YYYY-MM-DD" strings over JSON). */
export interface CreateAppointmentRequest {
  customer: string;
  email?: string;
  phone?: string;
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  status?: AppointmentStatus;
  /** Admin force-book past the availability/capacity check. */
  override?: boolean;
}

export type UpdateAppointmentRequest = Partial<
  Omit<CreateAppointmentRequest, "email">
>;
