"use client";

// Compatibility shim: the old localStorage `AppointmentsProvider` is gone.
// `useAppointments` now reads/writes real bookings through the API (React Query),
// keeping the same surface the existing UI expects.

import { useBookings } from "@/features/bookings/hooks/queries";
import { useCancelBooking, useCreateBooking } from "@/features/bookings/hooks/mutations";
import type { CreateBookingRequest } from "@/features/bookings/types/booking.api";
import type { BookingView } from "@/features/bookings/types/booking.view";

export type PublicAppointment = BookingView;
export type NewAppointment = CreateBookingRequest;

export function useAppointments() {
  const { data: appointments = [] } = useBookings();
  const create = useCreateBooking();
  const cancel = useCancelBooking();

  return {
    appointments,
    /** Returns the created booking. Rejects with a user-facing message on failure. */
    addAppointment: (input: NewAppointment): Promise<PublicAppointment> =>
      create.mutateAsync(input),
    cancelAppointment: (id: string) => cancel.mutate(id),
  };
}
