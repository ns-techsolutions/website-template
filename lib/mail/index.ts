import { format } from "date-fns";

import { getTenantDb } from "@/lib/db/tenant";
import { integrationSettingsService } from "@/features/admin/integrations/services/integration-settings.service";
import { formatSlotLabel } from "@/lib/admin/time-slots";

import {
  bookingConfirmationEmail,
  bookingStatusEmail,
  contactNotificationEmail,
  emailOtpEmail,
  passwordResetEmail,
  type EmailContent,
} from "./templates";

interface SendArgs extends EmailContent {
  to: string;
}

async function tenantEmailConfig() {
  const db = await getTenantDb();
  const ws = await db.workspace.findFirst({ select: { id: true } });
  if (!ws) return null;
  return integrationSettingsService.getResolved(ws.id);
}

/**
 * Whether the current salon can actually deliver email (Resend enabled + keyed +
 * a from-address). The single source of truth for "is OTP verification possible
 * for this salon" — both the OTP request and consume paths gate on it so they
 * agree: when email is off, OTP is skipped and signup/booking proceed unverified.
 */
export async function isTenantEmailEnabled(): Promise<boolean> {
  const cfg = await tenantEmailConfig();
  return Boolean(cfg && cfg.emailEnabled && cfg.resendApiKey && cfg.emailFrom);
}

/**
 * Sends one email via the current salon's Resend config. Never throws — returns
 * false (and logs) when email is disabled/unconfigured or the send fails, so a
 * failed email can never break the request that triggered it.
 */
export async function sendMail({ to, subject, html }: SendArgs): Promise<boolean> {
  try {
    const cfg = await tenantEmailConfig();
    if (!cfg || !cfg.emailEnabled || !cfg.resendApiKey || !cfg.emailFrom) {
      console.warn("[mail] skipped — email not configured for this salon");
      return false;
    }
    const { Resend } = await import("resend");
    const resend = new Resend(cfg.resendApiKey);
    const { error } = await resend.emails.send({
      from: cfg.emailFrom,
      to,
      subject,
      html,
      ...(cfg.emailReplyTo ? { replyTo: cfg.emailReplyTo } : {}),
    });
    if (error) {
      console.error("[mail] Resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mail] send failed:", e);
    return false;
  }
}

interface BookingEmailData {
  email: string;
  customerName: string;
  reference: string;
  service: string;
  date: Date;
  time: string;
  staff?: string | null;
}

export function sendBookingConfirmation(b: BookingEmailData): Promise<boolean> {
  return sendMail({
    to: b.email,
    ...bookingConfirmationEmail({
      customerName: b.customerName,
      reference: b.reference,
      service: b.service,
      dateLabel: format(b.date, "EEEE, PPP"),
      timeLabel: formatSlotLabel(b.time),
      staff: b.staff,
    }),
  });
}

const CURRENCY_SYMBOLS: Record<string, string> = { gbp: "£", usd: "$", eur: "€" };

/** "£12" for known currencies, otherwise "12 USD". */
function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toLowerCase()];
  return symbol ? `${symbol}${amount}` : `${amount} ${currency.toUpperCase()}`;
}

export function sendBookingStatusUpdate(
  b: Omit<BookingEmailData, "time" | "staff">,
  status: string,
  opts?: { refundedAmount?: number; currency?: string },
): Promise<boolean> {
  const refundLabel =
    opts?.refundedAmount != null
      ? formatMoney(opts.refundedAmount, opts.currency ?? "gbp")
      : undefined;
  return sendMail({
    to: b.email,
    ...bookingStatusEmail({
      customerName: b.customerName,
      reference: b.reference,
      service: b.service,
      status,
      dateLabel: format(b.date, "EEEE, PPP"),
      refundLabel,
    }),
  });
}

export function sendPasswordReset(to: string, resetUrl: string): Promise<boolean> {
  return sendMail({ to, ...passwordResetEmail({ resetUrl }) });
}

export function sendEmailOtp(
  to: string,
  code: string,
  purpose: "signup" | "booking",
): Promise<boolean> {
  return sendMail({ to, ...emailOtpEmail({ code, purpose }) });
}

export function sendContactNotification(
  to: string,
  payload: { name: string; email: string; subject: string; message: string },
): Promise<boolean> {
  return sendMail({ to, ...contactNotificationEmail(payload) });
}
