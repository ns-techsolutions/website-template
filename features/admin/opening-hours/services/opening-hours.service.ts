import type { SalonHours } from "../types";
import { openingHoursRepository } from "../repositories/opening-hours.repository";
import { updateSalonHoursSchema } from "../validations/opening-hours.schema";

export const openingHoursService = {
  get(workspaceId: string): Promise<SalonHours> {
    return openingHoursRepository.get(workspaceId);
  },

  update(workspaceId: string, raw: unknown): Promise<SalonHours> {
    const input = updateSalonHoursSchema.parse(raw);
    return openingHoursRepository.upsert(workspaceId, input);
  },
};
