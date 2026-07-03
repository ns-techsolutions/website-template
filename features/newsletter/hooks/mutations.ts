"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { newsletterApi } from "../services/newsletter-query.service";
import type { SubscribeInput } from "../validations/newsletter.schema";

export function useSubscribe() {
  return useAppMutation({
    mutationFn: (input: SubscribeInput) => newsletterApi.subscribe(input),
    successMessage:
      "Thank you for subscribing to our newsletter! You will receive a confirmation email shortly.",
  });
}
