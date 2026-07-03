"use client";

import { apiFetch } from "@/lib/api/client";
import type { Review } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validations/review.schema";

export const reviewApi = {
  list: () =>
    apiFetch<Review[]>("/api/reviews", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreateReviewInput) =>
    apiFetch<Review>("/api/reviews", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdateReviewInput) =>
    apiFetch<Review>(`/api/reviews/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<Review>(`/api/reviews/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
