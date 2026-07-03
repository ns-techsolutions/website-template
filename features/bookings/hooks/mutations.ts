"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { bookingKeys } from "../queries/booking.keys";
import { bookingApi } from "../services/booking-query.service";
import type { CreateBookingRequest } from "../types/booking.api";

export function useCreateBooking(options?: { showSuccessToast?: boolean }) {
  return useAppMutation({
    mutationFn: (input: CreateBookingRequest) => bookingApi.create(input),
    invalidateKeys: [bookingKeys.lists()],
    successMessage: "Booking confirmed",
    // The public booking form drives its own messaging (inline banner / payment
    // redirect), so it opts out — a booking that needs a deposit isn't confirmed
    // until payment succeeds, and we must not flash "confirmed" before redirecting.
    showSuccessToast: options?.showSuccessToast ?? true,
  });
}

export function useRescheduleBooking() {
  return useAppMutation({
    mutationFn: ({ id, date, time }: { id: string; date: string; time: string }) =>
      bookingApi.reschedule(id, { date, time }),
    invalidateKeys: [bookingKeys.lists()],
    successMessage: "Booking rescheduled",
  });
}

export function useCancelBooking() {
  return useAppMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    invalidateKeys: [bookingKeys.lists()],
    successMessage: "Booking cancelled",
  });
}
