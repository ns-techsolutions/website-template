"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { settingsKeys } from "../queries/settings.keys";
import { settingsApi } from "../services/settings-query.service";
import type { UpdateSettingsInput } from "../validations/settings.schema";

export function useUpdateSettings() {
  return useAppMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsApi.update(input),
    invalidateKeys: [settingsKeys.all],
    successMessage: "Appearance saved",
  });
}
