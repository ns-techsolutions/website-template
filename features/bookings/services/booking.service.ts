import type { Prisma } from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";
import type { AuthUser } from "@/lib/auth/get-auth-user";

import { cancelBookingUseCase } from "../business/cancel-booking.usecase";
import { createBookingUseCase } from "../business/create-booking.usecase";
import { assertBookingOwnership } from "../business/validate-booking";
import { toBookingView } from "../mappers/booking.mapper";
import { bookingRepository } from "../repositories/booking.repository";
import type { BookingView } from "../types/booking.view";
import {
  createBookingSchema,
  updateBookingSchema,
} from "../validations/booking.schema";

/** Server-side orchestration used by the booking route handlers. */
export const bookingService = {
  create(raw: unknown, userId: string | null): Promise<BookingView> {
    const input = createBookingSchema.parse(raw);
    return createBookingUseCase(input, userId);
  },

  async listForUser(user: AuthUser): Promise<BookingView[]> {
    const rows = await bookingRepository.listForUser({
      userId: user.id,
      email: user.email.toLowerCase(),
    });
    return rows.map(toBookingView);
  },

  async getOne(id: string, user: AuthUser): Promise<BookingView> {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found.");
    assertBookingOwnership(booking, user);
    return toBookingView(booking);
  },

  /** Public lookup by reference — the random reference acts as the access token. */
  async getByReference(reference: string): Promise<BookingView> {
    // References are always generated uppercase (e.g. "RB-XXXX"), but Postgres
    // string equality is case-sensitive. Normalize the incoming value so a guest
    // pasting a lowercased reference doesn't get a spurious 404.
    const normalized = reference.trim().toUpperCase();
    const booking = await bookingRepository.findByReference(normalized);
    if (!booking) throw new NotFoundError("Booking not found.");
    return toBookingView(booking);
  },

  async update(id: string, raw: unknown, user: AuthUser): Promise<BookingView> {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found.");
    assertBookingOwnership(booking, user);

    const input = updateBookingSchema.parse(raw);
    const data: Prisma.BookingUpdateInput = {};
    if (input.status) data.status = input.status;
    if (input.date) data.date = input.date;
    if (input.time) data.time = input.time;

    const updated = await bookingRepository.update(id, data);
    return toBookingView(updated);
  },

  cancel(id: string, user: AuthUser): Promise<BookingView> {
    return cancelBookingUseCase(id, user);
  },
};
