import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { Closure, OpeningHour } from "@/lib/admin/types";

import type { SalonHours } from "../types";
import type { UpdateSalonHoursInput } from "../validations/opening-hours.schema";

const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

const DEFAULT: SalonHours = {
  openingHours: [],
  closures: [],
  slotDurationMinutes: 30,
  bufferMinutes: 0,
  cancellationCutoffHours: 24,
  defaultCountry: "GB",
};

type Row = Prisma.SalonSettingsGetPayload<object>;

function toDto(row: Row | null): SalonHours {
  if (!row) return DEFAULT;
  return {
    openingHours: (row.openingHours ?? []) as unknown as OpeningHour[],
    closures: (row.closures ?? []) as unknown as Closure[],
    slotDurationMinutes: row.slotDurationMinutes,
    bufferMinutes: row.bufferMinutes ?? 0,
    cancellationCutoffHours: row.cancellationCutoffHours ?? 24,
    defaultCountry: row.defaultCountry ?? "GB",
  };
}

export const openingHoursRepository = {
  async get(workspaceId: string): Promise<SalonHours> {
    const db = await getTenantDb();
    const row = await db.salonSettings.findUnique({ where: { workspaceId } });
    return toDto(row);
  },

  async upsert(
    workspaceId: string,
    input: UpdateSalonHoursInput,
  ): Promise<SalonHours> {
    const db = await getTenantDb();
    const row = await db.salonSettings.upsert({
      where: { workspaceId },
      update: {
        openingHours: json(input.openingHours),
        closures: json(input.closures),
        slotDurationMinutes: input.slotDurationMinutes,
        bufferMinutes: input.bufferMinutes,
        cancellationCutoffHours: input.cancellationCutoffHours,
      },
      create: {
        workspaceId,
        openingHours: json(input.openingHours),
        closures: json(input.closures),
        slotDurationMinutes: input.slotDurationMinutes,
        bufferMinutes: input.bufferMinutes,
        cancellationCutoffHours: input.cancellationCutoffHours,
      },
    });
    return toDto(row);
  },
};
