"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

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
import { PhoneInput } from "@/components/common/PhoneInput";
import { useCatalogHours } from "@/features/catalog/hooks/queries";
import { useAuth, type SignUpInput } from "@/components/common/auth/auth-context";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/validations/auth.schema";
import { useRequestEmailOtp } from "@/features/email-otp/hooks/mutations";
import { OtpStep } from "@/features/email-otp/components/OtpStep";

import { AuthShell, type AuthShellProps } from "./AuthShell";

export interface SignUpFormProps extends AuthShellProps {
  buttonLabel?: string;
  termsText?: string;
}

// Full-page sign-up block — mirrors the SignUpDialog body but lives on a CMS
// page and redirects to /account on success.
export function SignUpForm({ buttonLabel, termsText, ...shell }: SignUpFormProps) {
  const { signUp } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"details" | "code">("details");
  const [pending, setPending] = useState<RegisterInput | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const requestOtp = useRequestEmailOtp();
  const { data: salonHours } = useCatalogHours();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const loading = form.formState.isSubmitting;

  async function finishSignUp(values: SignUpInput) {
    await signUp(values);
    router.push("/account");
  }

  async function onSubmit(values: RegisterInput) {
    setError(null);
    try {
      const { required } = await requestOtp.mutateAsync({
        email: values.email,
        purpose: "signup",
      });
      if (!required) {
        await finishSignUp(values);
        return;
      }
      setPending(values);
      setPhase("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    }
  }

  async function handleVerify(code: string) {
    if (!pending) return;
    setCodeError(null);
    setVerifying(true);
    try {
      await finishSignUp({ ...pending, code });
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Unable to verify the code.");
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!pending) return;
    setCodeError(null);
    try {
      await requestOtp.mutateAsync({ email: pending.email, purpose: "signup" });
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Unable to resend the code.");
    }
  }

  if (phase === "code") {
    return (
      <AuthShell {...shell}>
        <OtpStep
          email={pending?.email ?? ""}
          onSubmit={handleVerify}
          onResend={handleResend}
          onBack={() => setPhase("details")}
          submitting={verifying}
          error={codeError}
          submitLabel="Verify & create account"
        />
      </AuthShell>
    );
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
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>Full name</FormLabel>
                <div className="relative">
                  <UserIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="Jane Doe" className="h-11 pl-9" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>
                  Phone{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    defaultCountry={salonHours?.defaultCountry}
                    placeholder="7700 900000"
                    className="h-11"
                  />
                </FormControl>
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
                      placeholder="At least 6 characters"
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

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Sending code…
              </>
            ) : (
              buttonLabel || "Continue"
            )}
          </Button>

          {termsText && (
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              {termsText}
            </p>
          )}
        </form>
      </Form>
    </AuthShell>
  );
}
