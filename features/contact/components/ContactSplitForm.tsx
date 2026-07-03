"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSubmitContact } from "../hooks/mutations";
import {
  createContactSchema,
  type CreateContactInput,
} from "../validations/contact.schema";

const fieldClass = "h-12 rounded-lg border-border bg-white px-4 text-base";

/**
 * Interactive message form for the public contact-split CMS block. Keeps the
 * block a server component while driving the submit label from CMS data.
 */
export function ContactSplitForm({ buttonLabel }: { buttonLabel: string }) {
  const submitContact = useSubmitContact();

  const form = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: CreateContactInput) {
    await submitContact.mutateAsync(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Name"
                  autoComplete="name"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Message"
                  rows={5}
                  className="h-32 resize-none rounded-lg border-border bg-white p-4 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={submitContact.isPending}
          className="reine-btn reine-btn-dark w-full disabled:opacity-60"
        >
          {submitContact.isPending ? "Sending…" : buttonLabel}
        </button>
      </form>
    </Form>
  );
}
