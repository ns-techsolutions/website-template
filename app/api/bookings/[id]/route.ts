import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { bookingService } from "@/features/bookings/services/booking.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await getAuthUser(req);
  const { id } = await ctx.params;
  const booking = await bookingService.getOne(id, user);
  return successJson(booking);
});

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await getAuthUser(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const booking = await bookingService.update(id, body, user);
  return successJson(booking, { message: "Booking updated" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await getAuthUser(req);
  const { id } = await ctx.params;
  const booking = await bookingService.cancel(id, user);
  return successJson(booking, { message: "Booking cancelled" });
});
