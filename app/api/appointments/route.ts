import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import type { AppointmentStatus } from "@/lib/admin/types";
import { appointmentService } from "@/features/admin/appointments/services/appointment.service";

const STATUSES: AppointmentStatus[] = [
  "pending", "confirmed", "completed", "cancelled", "no-show",
];

function posInt(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

// Admin view over bookings in this salon's database, with optional
// search (`q`), `status` filter, and `limit`/`offset` paging.
export const GET = withApi(async (req: NextRequest) => {
  await requireStaff(req);
  const sp = req.nextUrl.searchParams;
  const rawStatus = sp.get("status")?.trim() ?? "";
  const status = (STATUSES as string[]).includes(rawStatus)
    ? (rawStatus as AppointmentStatus)
    : undefined;
  return successJson(
    await appointmentService.list({
      q: sp.get("q")?.trim() || undefined,
      status,
      limit: posInt(sp.get("limit")),
      offset: posInt(sp.get("offset")),
    }),
  );
});

export const POST = withApi(async (req: NextRequest) => {
  await requirePermission(req, "appointments.manage");
  const body = await req.json().catch(() => ({}));
  const appointment = await appointmentService.create(body);
  return successJson(appointment, {
    status: 201,
    message: "Appointment created",
  });
});
