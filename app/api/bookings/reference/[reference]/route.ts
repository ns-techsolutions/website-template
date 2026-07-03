import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { bookingService } from "@/features/bookings/services/booking.service";

type Ctx = { params: Promise<{ reference: string }> };

// Public: look up a single booking by its reference (no auth — the reference is
// the capability token). Lets guests review a booking without an account.
export const GET = withApi<Ctx>(async (_req: NextRequest, ctx) => {
  const { reference } = await ctx.params;
  return successJson(await bookingService.getByReference(reference));
});
