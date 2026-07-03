"use client";

import { useState } from "react";
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
import { PhoneInput } from "@/components/common/PhoneInput";
import { useCatalogHours } from "@/features/catalog/hooks/queries";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/validations/auth.schema";
import { useRequestEmailOtp } from "@/features/email-otp/hooks/mutations";
import { OtpStep } from "@/features/email-otp/components/OtpStep";
import type { SignUpInput } from "./auth-context";

export function SignUpDialog({
  open,
  onOpenChange,
  onSwitchToSignIn,
  signUp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void;
  signUp: (data: SignUpInput) => Promise<void>;
}) {
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

  function reset() {
    form.reset();
    setShowPassword(false);
    setError(null);
    setPhase("details");
    setPending(null);
    setCodeError(null);
    setVerifying(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function finishSignUp(values: SignUpInput) {
    await signUp(values);
    reset();
    onOpenChange(false);
  }

  async function onSubmit(values: RegisterInput) {
    setError(null);
    try {
      const { required } = await requestOtp.mutateAsync({
        email: values.email,
        purpose: "signup",
      });
      if (!required) {
        // Salon can't deliver email — create the account without verification.
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
    } finally {
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

  const loading = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {phase === "code" ? "Verify your email" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {phase === "code"
              ? "We've emailed you a code to confirm it's really you."
              : "Join Reine to book faster and manage your appointments."}
          </DialogDescription>
        </DialogHeader>

        {phase === "code" ? (
          <OtpStep
            email={pending?.email ?? ""}
            onSubmit={handleVerify}
            onResend={handleResend}
            onBack={() => setPhase("details")}
            submitting={verifying}
            error={codeError}
            submitLabel="Verify & create account"
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
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
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        )}

        {phase === "details" && (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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
