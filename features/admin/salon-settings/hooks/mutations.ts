"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { salonSettingsKeys } from "../queries/salon-settings.keys";
import { salonSettingsApi } from "../services/salon-settings-query.service";
import type { UpdateSalonSettingsInput } from "../validations/salon-settings.schema";

export function useUpdateSalonSettings() {
  return useAppMutation({
    mutationFn: (input: UpdateSalonSettingsInput) =>
      salonSettingsApi.update(input),
    invalidateKeys: [salonSettingsKeys.all],
    successMessage: "Settings saved",
  });
}
