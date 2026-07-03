"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  MailIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAdminForgotPassword } from "@/features/admin/auth/hooks/mutations"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/validations/auth.schema"

import { AuthShell } from "./AuthShell"

interface ForgotPasswordViewProps {
  brandName: string
  isPlatform?: boolean
}

export function ForgotPasswordView({
  brandName,
  isPlatform = false,
}: ForgotPasswordViewProps) {
  const [sent, setSent] = useState(false)
  const forgot = useAdminForgotPassword()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    // Always land on the confirmation — the endpoint never reveals whether the
    // email is registered, so a failed request shouldn't tell the user either.
    await forgot.mutateAsync(values).catch(() => {})
    setSent(true)
  }

  const loading = form.formState.isSubmitting

  return (
    <AuthShell brandName={brandName} isPlatform={isPlatform}>
      <div className="mb-8 space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Reset your password
        </h2>
        <p className="text-sm text-muted-foreground">
          {sent
            ? "Check your inbox for the reset link."
            : "Enter your email and we'll send you a link to reset your password."}
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
            <p>
              If that email is registered, a reset link is on its way. Check your
              inbox.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full text-sm font-semibold"
          >
            <Link href="/admin/login">
              <ArrowLeftIcon className="size-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
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
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/admin/login"
            className="font-semibold text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </AuthShell>
  )
}
