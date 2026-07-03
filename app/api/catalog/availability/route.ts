import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { BadRequestError } from "@/lib/api/errors";
import { catalogService } from "@/features/catalog/services/catalog.service";

// Public: open time slots for a "yyyy-MM-dd" date. Optional `serviceId`
// (duration-aware blocking) and `staffId` (per-staff availability) narrow it.
export const GET = withApi(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const date = params.get("date")?.trim();
  if (!date) throw new BadRequestError("A date is required.");
  const serviceId = params.get("serviceId")?.trim() || undefined;
  const staffId = params.get("staffId")?.trim() || undefined;
  return successJson(await catalogService.availability(date, { serviceId, staffId }));
});
