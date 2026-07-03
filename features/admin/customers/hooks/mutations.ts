"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { customerKeys } from "../queries/customer.keys";
import { customerApi } from "../services/customer-query.service";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../validations/customer.schema";

export function useCreateCustomer() {
  return useAppMutation({
    mutationFn: (input: CreateCustomerInput) => customerApi.create(input),
    invalidateKeys: [customerKeys.lists()],
    successMessage: "Customer created",
  });
}

export function useUpdateCustomer() {
  return useAppMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      customerApi.update(id, input),
    invalidateKeys: [customerKeys.lists()],
    successMessage: "Customer updated",
  });
}
