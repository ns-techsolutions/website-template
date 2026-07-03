"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import type { CustomerReviewInput } from "@/features/admin/reviews/validations/review.schema";
import { customerReviewKeys } from "../queries/review.keys";
import { customerReviewApi } from "../services/review-query.service";

export function useSubmitReview() {
  return useAppMutation({
    mutationFn: (input: CustomerReviewInput) => customerReviewApi.submit(input),
    invalidateKeys: [customerReviewKeys.mine()],
    successMessage: "Thanks for your review!",
  });
}
