"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  MailIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForgotPassword } from "@/features/auth/hooks/mutations";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/validations/auth.schema";

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  onSwitchToSignIn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void;
}) {
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function reset() {
    form.reset();
    setSent(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function onSubmit(values: ForgotPasswordInput) {
    await forgot.mutateAsync(values).catch(() => {});
    setSent(true);
  }

  const loading = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Reset your password</DialogTitle>
          <DialogDescription>
            {sent
              ? "Check your inbox for the reset link."
              : "Enter your email and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
              <p>
                If that email is registered, a reset link is on its way. Check
                your inbox.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full text-sm font-semibold"
              onClick={() => {
                reset();
                onSwitchToSignIn();
              }}
            >
              <ArrowLeftIcon className="size-4" />
              Back to sign in
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>Email address</FormLabel>
                    <div className="relative">
                      <MailIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-11 pl-9"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </Form>
        )}

        {!sent && (
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-semibold text-foreground hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
