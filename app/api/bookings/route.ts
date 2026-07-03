import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getAuthUser, getOptionalAuthUser } from "@/lib/auth/get-auth-user";
import { bookingService } from "@/features/bookings/services/booking.service";

// List the signed-in user's bookings (401 INVALID_TOKEN without a valid token).
export const GET = withApi(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const bookings = await bookingService.listForUser(user);
  return successJson(bookings);
});

// Create a booking. Guests may book; a token (when present) links the user.
export const POST = withApi(async (req: NextRequest) => {
  const user = await getOptionalAuthUser(req);
  const body = await req.json().catch(() => ({}));
  const booking = await bookingService.create(body, user?.id ?? null);
  return successJson(booking, { status: 201, message: "Booking created" });
});
