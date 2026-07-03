"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { serviceCategoryKeys } from "@/features/admin/service-categories/queries/service-category.keys";
import { serviceKeys } from "../queries/service.keys";
import { serviceApi } from "../services/service-query.service";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "../validations/service.schema";

export function useCreateService() {
  return useAppMutation({
    mutationFn: (input: CreateServiceInput) => serviceApi.create(input),
    // Category service counts change when a service is added.
    invalidateKeys: [serviceKeys.lists(), serviceCategoryKeys.lists()],
    successMessage: "Service created",
  });
}

export function useUpdateService() {
  return useAppMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceInput }) =>
      serviceApi.update(id, input),
    invalidateKeys: [serviceKeys.lists(), serviceCategoryKeys.lists()],
    successMessage: "Service updated",
  });
}

export function useDeleteService() {
  return useAppMutation({
    mutationFn: (id: string) => serviceApi.remove(id),
    invalidateKeys: [serviceKeys.lists(), serviceCategoryKeys.lists()],
    successMessage: "Service deleted",
  });
}
