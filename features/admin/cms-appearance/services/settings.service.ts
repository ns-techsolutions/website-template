import type { SettingsDto } from "../types/settings.dto";
import {
  settingsRepository,
  toSettingsDto,
} from "../repositories/settings.repository";
import { updateSettingsSchema } from "../validations/settings.schema";

export const settingsService = {
  async get(workspaceId: string): Promise<SettingsDto> {
    const row =
      (await settingsRepository.get(workspaceId)) ??
      (await settingsRepository.createDefault(workspaceId));
    return toSettingsDto(row);
  },

  async update(workspaceId: string, raw: unknown): Promise<SettingsDto> {
    const input = updateSettingsSchema.parse(raw);
    return toSettingsDto(await settingsRepository.upsert(workspaceId, input));
  },
};
