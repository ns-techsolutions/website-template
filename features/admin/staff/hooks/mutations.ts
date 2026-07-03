"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { staffKeys } from "../queries/staff.keys";
import { staffApi } from "../services/staff-query.service";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../validations/staff.schema";

export function useCreateStaff() {
  return useAppMutation({
    mutationFn: (input: CreateStaffInput) => staffApi.create(input),
    invalidateKeys: [staffKeys.lists()],
    successMessage: "Staff member added",
  });
}

export function useUpdateStaff() {
  return useAppMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) =>
      staffApi.update(id, input),
    invalidateKeys: [staffKeys.lists()],
    successMessage: "Staff member updated",
  });
}

export function useDeleteStaff() {
  return useAppMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    invalidateKeys: [staffKeys.lists()],
    successMessage: "Staff member removed",
  });
}
