"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
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
import { useAdminResetPassword } from "@/features/admin/auth/hooks/mutations"
import {
  resetPasswordFormSchema,
  type ResetPasswordFormInput,
} from "@/features/auth/validations/auth.schema"

import { AuthShell } from "./AuthShell"

interface ResetPasswordViewProps {
  brandName: string
  isPlatform?: boolean
  token: string
}

export function ResetPasswordView({
  brandName,
  isPlatform = false,
  token,
}: ResetPasswordViewProps) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const resetPw = useAdminResetPassword()

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(values: ResetPasswordFormInput) {
    setError(null)
    try {
      await resetPw.mutateAsync({ token, newPassword: values.newPassword })
      setDone(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset your password.",
      )
    }
  }

  const loading = form.formState.isSubmitting

  if (!token) {
    return (
      <AuthShell brandName={brandName} isPlatform={isPlatform}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Invalid reset link
            </h2>
            <p className="text-sm text-muted-foreground">
              This reset link is missing its token. Please request a new one.
            </p>
          </div>
          <Button asChild className="h-11 w-full text-sm font-semibold">
            <Link href="/admin/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell brandName={brandName} isPlatform={isPlatform}>
      <div className="mb-8 space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Choose a new password
        </h2>
        <p className="text-sm text-muted-foreground">
          {done
            ? "Your password has been reset successfully."
            : "Enter a new password for your account."}
        </p>
      </div>

      {done ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
            <p>
              Your password has been reset. You can now sign in with your new
              password.
            </p>
          </div>
          <Button asChild className="h-11 w-full text-sm font-semibold">
            <Link href="/admin/login">Sign in</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>New password</FormLabel>
                  <div className="relative">
                    <LockIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 px-9"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Confirm new password</FormLabel>
                  <div className="relative">
                    <LockIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 px-9"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Resetting…
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </Form>
      )}
    </AuthShell>
  )
}
