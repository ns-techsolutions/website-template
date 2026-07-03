import type { Booking, BookingStatus } from "@prisma/client";

/** Persisted booking row (the Prisma model). */
export type BookingEntity = Booking;

export type { BookingStatus };
