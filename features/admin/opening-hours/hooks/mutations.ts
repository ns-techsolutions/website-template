"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { openingHoursKeys } from "../queries/opening-hours.keys";
import { openingHoursApi } from "../services/opening-hours-query.service";
import type { UpdateSalonHoursInput } from "../validations/opening-hours.schema";

export function useUpdateOpeningHours() {
  return useAppMutation({
    mutationFn: (input: UpdateSalonHoursInput) => openingHoursApi.update(input),
    invalidateKeys: [openingHoursKeys.all],
    successMessage: "Opening hours updated",
  });
}
