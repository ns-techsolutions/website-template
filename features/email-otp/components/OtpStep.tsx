"use client";

import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RESEND_SECONDS = 60;

export interface OtpStepProps {
  email: string;
  /** Verifies the entered code (performs the real register/booking action). */
  onSubmit: (code: string) => void | Promise<void>;
  /** Re-requests a code. OtpStep restarts its own cooldown afterwards. */
  onResend: () => void | Promise<void>;
  /** Return to the details step (e.g. to change the email). */
  onBack: () => void;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
  className?: string;
}

/**
 * Shared "enter the code" step for the signup and guest-booking flows. Owns the
 * code input and the resend cooldown; the parent owns the request/verify calls.
 */
export function OtpStep({
  email,
  onSubmit,
  onResend,
  onBack,
  submitting = false,
  error,
  submitLabel = "Verify",
  className,
}: OtpStepProps) {
  const [code, setCode] = useState("");
  // A code was just sent to reach this step, so start in cooldown.
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 6) void onSubmit(code);
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setCode("");
      setCooldown(RESEND_SECONDS);
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 text-left ${className ?? ""}`}
    >
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code we sent to{" "}
        <span className="font-medium text-foreground">{email}</span>.
      </p>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Input
        value={code}
        onChange={(e) =>
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={6}
        placeholder="••••••"
        aria-label="Verification code"
        className="h-12 text-center text-lg tracking-[0.5em]"
      />

      <Button
        type="submit"
        disabled={submitting || code.length !== 6}
        className="h-11 w-full text-sm font-semibold"
      >
        {submitting ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Verifying…
          </>
        ) : (
          submitLabel
        )}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Change email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="font-medium text-foreground hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : resending
              ? "Sending…"
              : "Resend code"}
        </button>
      </div>
    </form>
  );
}
