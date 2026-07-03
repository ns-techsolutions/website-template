"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { bookingKeys } from "../queries/booking.keys";
import { bookingApi } from "../services/booking-query.service";

/** The signed-in user's bookings. Disabled (returns nothing) for guests. */
export function useBookings() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: () => bookingApi.list(),
    enabled: !!token,
  });
}

export function useBooking(id: string | undefined) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.detail(id ?? ""),
    queryFn: () => bookingApi.get(id as string),
    enabled: !!token && !!id,
  });
}
