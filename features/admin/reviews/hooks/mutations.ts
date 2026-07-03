"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { reviewKeys } from "../queries/review.keys";
import { reviewApi } from "../services/review-query.service";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validations/review.schema";

export function useCreateReview() {
  return useAppMutation({
    mutationFn: (input: CreateReviewInput) => reviewApi.create(input),
    invalidateKeys: [reviewKeys.lists()],
    successMessage: "Review created",
  });
}

export function useUpdateReview() {
  return useAppMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReviewInput }) =>
      reviewApi.update(id, input),
    invalidateKeys: [reviewKeys.lists()],
    successMessage: "Review updated",
  });
}

export function useDeleteReview() {
  return useAppMutation({
    mutationFn: (id: string) => reviewApi.remove(id),
    invalidateKeys: [reviewKeys.lists()],
    successMessage: "Review deleted",
  });
}
