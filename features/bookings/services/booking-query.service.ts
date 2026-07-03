"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  CreateBookingRequest,
  UpdateBookingRequest,
} from "../types/booking.api";
import type { BookingView } from "../types/booking.view";

/** Client-side fetchers for the booking endpoints (consumed by the hooks). */
export const bookingApi = {
  list: () =>
    apiFetch<BookingView[]>("/api/bookings", { method: "GET", auth: true }),

  get: (id: string) =>
    apiFetch<BookingView>(`/api/bookings/${id}`, { method: "GET", auth: true }),

  /** Public lookup by reference (guest-friendly, no auth). */
  getByReference: (reference: string) =>
    apiFetch<BookingView>(`/api/bookings/reference/${reference}`, {
      method: "GET",
    }),

  // `auth: true` attaches the token when signed in; guests simply send none.
  create: (body: CreateBookingRequest) =>
    apiFetch<BookingView>("/api/bookings", { method: "POST", body, auth: true }),

  reschedule: (id: string, body: Pick<UpdateBookingRequest, "date" | "time">) =>
    apiFetch<BookingView>(`/api/bookings/${id}`, {
      method: "PATCH",
      body,
      auth: true,
    }),

  cancel: (id: string) =>
    apiFetch<BookingView>(`/api/bookings/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  checkout: (bookingId: string) =>
    apiFetch<{ url: string | null; paymentId: string }>("/api/payments/checkout", {
      method: "POST",
      body: { bookingId },
      auth: true,
    }),
};
