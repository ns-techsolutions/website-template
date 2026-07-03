import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { appointmentService } from "@/features/admin/appointments/services/appointment.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requireStaff(req);
  const { id } = await ctx.params;
  return successJson(await appointmentService.get(id));
});

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requirePermission(req, "appointments.manage");
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const appointment = await appointmentService.update(id, body);
  return successJson(appointment, { message: "Appointment saved" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requirePermission(req, "appointments.manage");
  const { id } = await ctx.params;
  const appointment = await appointmentService.remove(id);
  return successJson(appointment, { message: "Appointment deleted" });
});
