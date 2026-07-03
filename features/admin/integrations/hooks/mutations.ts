"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { integrationSettingsKeys } from "../queries/integration-settings.keys";
import { integrationSettingsApi } from "../services/integration-settings-query.service";
import type { UpdateIntegrationSettingsInput } from "../validations/integration-settings.schema";

export function useUpdateIntegrationSettings() {
  return useAppMutation({
    mutationFn: (input: UpdateIntegrationSettingsInput) =>
      integrationSettingsApi.update(input),
    invalidateKeys: [integrationSettingsKeys.all],
    successMessage: "Integrations saved",
  });
}
