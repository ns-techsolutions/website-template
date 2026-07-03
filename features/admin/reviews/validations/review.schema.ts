import { z } from "zod";

export const createReviewSchema = z.object({
  customer: z.string().trim().min(1, "Customer is required"),
  service: z.string().trim().min(1, "Service is required"),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().trim().optional(),
  bookingId: z.string().trim().optional(),
  published: z.boolean().optional(),
});

export const updateReviewSchema = z
  .object({
    customer: z.string().trim().min(1).optional(),
    service: z.string().trim().min(1).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional(),
    published: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

// Customer-submitted review (storefront). The customer name + service are
// snapshotted server-side from the linked booking, so the client only sends the
// booking, the rating, and an optional comment.
export const customerReviewSchema = z.object({
  bookingId: z.string().trim().min(1, "A booking is required"),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CustomerReviewInput = z.infer<typeof customerReviewSchema>;
