"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { StarRatingInput } from "./StarRatingInput";
import { useSubmitReview } from "../hooks/mutations";
import { reviewFormSchema, type ReviewFormInput } from "../validations/review.schema";

/** Inline "leave a review" form for a single completed booking. */
export function LeaveReviewForm({ bookingId }: { bookingId: string }) {
  const submit = useSubmitReview();
  const form = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  function onSubmit(values: ReviewFormInput) {
    submit.mutate({
      bookingId,
      rating: values.rating,
      comment: values.comment,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={submit.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Tell others about your experience (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" disabled={submit.isPending}>
          {submit.isPending ? "Submitting…" : "Submit review"}
        </Button>
      </form>
    </Form>
  );
}
