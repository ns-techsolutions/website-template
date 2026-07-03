"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { staffKeys } from "@/features/admin/staff/queries/staff.keys";
import { roleKeys } from "../queries/role.keys";
import { roleApi } from "../services/role-query.service";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../validations/role.schema";

export function useCreateRole() {
  return useAppMutation({
    mutationFn: (input: CreateRoleInput) => roleApi.create(input),
    invalidateKeys: [roleKeys.lists()],
    successMessage: "Role created",
  });
}

export function useUpdateRole() {
  return useAppMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      roleApi.update(id, input),
    invalidateKeys: [roleKeys.lists()],
    successMessage: "Role updated",
  });
}

export function useDeleteRole() {
  return useAppMutation({
    mutationFn: (id: string) => roleApi.remove(id),
    // Deleting a role unassigns its staff (Staff.roleId → null).
    invalidateKeys: [roleKeys.lists(), staffKeys.lists()],
    successMessage: "Role deleted",
  });
}
