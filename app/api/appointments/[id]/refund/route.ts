import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/require-permission";
import { appointmentService } from "@/features/admin/appointments/services/appointment.service";

type Ctx = { params: Promise<{ id: string }> };

// Admin force-refund of a booking's deposit (ignores the cancellation window).
export const POST = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requirePermission(req, "appointments.manage");
  const { id } = await ctx.params;
  const appointment = await appointmentService.refund(id);
  return successJson(appointment, { message: "Deposit refunded" });
});
