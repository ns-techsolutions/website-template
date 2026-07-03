import { z } from "zod";

// Storefront "leave a review" form. The booking is supplied by the caller, so
// the form itself only collects a rating and an optional comment.
export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Please choose a rating")
    .max(5, "Please choose a rating"),
  comment: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
