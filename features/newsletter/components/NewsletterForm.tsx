"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSubscribe } from "../hooks/mutations";
import {
  subscribeSchema,
  type SubscribeInput,
} from "../validations/newsletter.schema";

/**
 * Interactive subscribe form for the public newsletter CMS block. Keeps the
 * block itself a server component while driving the pill input/button styling
 * and labels from CMS data.
 */
export function NewsletterForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  const subscribe = useSubscribe();

  const form = useForm<SubscribeInput>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: SubscribeInput) {
    try {
      await subscribe.mutateAsync(values);
    } finally {
      // A duplicate or transient error is non-critical — keep the UX positive.
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  type="email"
                  placeholder={placeholder}
                  aria-label="Email address"
                  className="h-12 rounded-full border-0 bg-white px-5 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="reine-btn reine-btn-dark h-12 disabled:opacity-60"
        >
          {subscribe.isPending ? "…" : buttonLabel}
        </button>
      </form>
    </Form>
  );
}
