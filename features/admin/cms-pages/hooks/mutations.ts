"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { pageKeys } from "../queries/page.keys";
import { pageApi } from "../services/page-query.service";
import type { CreatePageInput, UpdatePageInput } from "../validations/page.schema";

export function useCreatePage() {
  return useAppMutation({
    mutationFn: (input: CreatePageInput) => pageApi.create(input),
    invalidateKeys: [pageKeys.lists()],
    successMessage: "Page created",
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePageInput }) =>
      pageApi.update(id, input),
    invalidateKeys: [pageKeys.lists()],
    successMessage: "Page updated",
    onSuccess: (page) => {
      // The detail key is dynamic (depends on the result), so invalidate it here.
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(page.id) });
    },
  });
}

export function useDeletePage() {
  return useAppMutation({
    mutationFn: (id: string) => pageApi.remove(id),
    invalidateKeys: [pageKeys.lists()],
    successMessage: "Page deleted",
  });
}
