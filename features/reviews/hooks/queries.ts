"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { customerReviewKeys } from "../queries/review.keys";
import { customerReviewApi } from "../services/review-query.service";

/** The signed-in customer's own reviews (keyed by booking). Disabled for guests. */
export function useMyReviews() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: customerReviewKeys.mine(),
    queryFn: () => customerReviewApi.listMine(),
    enabled: !!token,
  });
}
