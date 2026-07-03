"use client";

import { apiFetch } from "@/lib/api/client";
import type { CustomerReview, Review } from "@/lib/admin/types";
import type { CustomerReviewInput } from "@/features/admin/reviews/validations/review.schema";

/** Customer-scoped storefront review calls (token attached when signed in). */
export const customerReviewApi = {
  submit: (body: CustomerReviewInput) =>
    apiFetch<Review>("/api/catalog/reviews", {
      method: "POST",
      body,
      auth: true,
    }),

  listMine: () =>
    apiFetch<CustomerReview[]>("/api/catalog/reviews/mine", {
      method: "GET",
      auth: true,
    }),
};
