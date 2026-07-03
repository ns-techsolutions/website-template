"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { contactApi } from "../services/contact-query.service";
import type { CreateContactInput } from "../validations/contact.schema";

export function useSubmitContact() {
  return useAppMutation({
    mutationFn: (input: CreateContactInput) => contactApi.submit(input),
    successMessage:
      "Thank you for your message! We will get back to you as soon as possible.",
  });
}
