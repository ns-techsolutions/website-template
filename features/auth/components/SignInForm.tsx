"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon } from "lucide-react";

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
import { useAuth } from "@/components/common/auth/auth-context";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/validations/auth.schema";

import { AuthShell, type AuthShellProps } from "./AuthShell";

export interface SignInFormProps extends AuthShellProps {
  buttonLabel?: string;
  forgotText?: string;
}

// Full-page sign-in block — mirrors the SignInDialog body but lives on a CMS
// page and redirects to /account on success. "Forgot password?" reuses the
// existing dialog via the auth context.
export function SignInForm({ buttonLabel, forgotText, ...shell }: SignInFormProps) {
  const { signIn, openForgotPassword } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loading = form.formState.isSubmitting;

  async function onSubmit(values: LoginInput) {
    setError(null);
    try {
      await signIn(values.email, values.password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  return (
    <AuthShell {...shell}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>Password</FormLabel>
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
                    onClick={() => setShowPassword((v) => !v)}
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={openForgotPassword}
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              {forgotText || "Forgot password?"}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              buttonLabel || "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
