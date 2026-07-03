import type { SalonProfile } from "../types/salon-settings.dto";
import { salonSettingsRepository } from "../repositories/salon-settings.repository";
import { updateSalonSettingsSchema } from "../validations/salon-settings.schema";

export const salonSettingsService = {
  get(workspaceId: string): Promise<SalonProfile> {
    return salonSettingsRepository.get(workspaceId);
  },

  update(workspaceId: string, raw: unknown): Promise<SalonProfile> {
    const input = updateSalonSettingsSchema.parse(raw);
    return salonSettingsRepository.update(workspaceId, input);
  },
};
