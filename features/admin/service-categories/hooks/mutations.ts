"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { serviceCategoryKeys } from "../queries/service-category.keys";
import { serviceCategoryApi } from "../services/service-category-query.service";
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from "../validations/service-category.schema";

export function useCreateServiceCategory() {
  return useAppMutation({
    mutationFn: (input: CreateServiceCategoryInput) =>
      serviceCategoryApi.create(input),
    invalidateKeys: [serviceCategoryKeys.lists()],
    successMessage: "Category created",
  });
}

export function useUpdateServiceCategory() {
  return useAppMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateServiceCategoryInput;
    }) => serviceCategoryApi.update(id, input),
    invalidateKeys: [serviceCategoryKeys.lists()],
    successMessage: "Category updated",
  });
}

export function useDeleteServiceCategory() {
  return useAppMutation({
    mutationFn: (id: string) => serviceCategoryApi.remove(id),
    invalidateKeys: [serviceCategoryKeys.lists()],
    successMessage: "Category deleted",
  });
}
