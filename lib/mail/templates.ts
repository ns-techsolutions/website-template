// Minimal inline-HTML email templates. Each returns a subject + html body.

export interface EmailContent {
  subject: string;
  html: string;
}

const wrap = (inner: string) =>
  `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.6">${inner}</div>`;

export function bookingConfirmationEmail(p: {
  customerName: string;
  reference: string;
  service: string;
  dateLabel: string;
  timeLabel: string;
  staff?: string | null;
}): EmailContent {
  return {
    subject: `Your booking is confirmed — ${p.reference}`,
    html: wrap(`
      <h2 style="font-weight:600">Thanks, ${p.customerName}!</h2>
      <p>We've received your booking. Here are the details:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Reference</td><td><strong>${p.reference}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Service</td><td>${p.service}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Date</td><td>${p.dateLabel}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Time</td><td>${p.timeLabel}</td></tr>
        ${p.staff ? `<tr><td style="padding:4px 12px 4px 0;color:#666">With</td><td>${p.staff}</td></tr>` : ""}
      </table>
      <p style="color:#666;font-size:13px">If you need to change or cancel, reply to this email or visit your account.</p>
    `),
  };
}

export function bookingStatusEmail(p: {
  customerName: string;
  reference: string;
  service: string;
  status: string;
  dateLabel: string;
  /** Pre-formatted refund amount (e.g. "£12") — appended when present. */
  refundLabel?: string;
}): EmailContent {
  const nice =
    p.status === "confirmed"
      ? "has been confirmed"
      : p.status === "cancelled"
        ? "has been cancelled"
        : `is now ${p.status}`;
  return {
    subject: `Your booking ${p.reference} ${nice}`,
    html: wrap(`
      <h2 style="font-weight:600">Hi ${p.customerName},</h2>
      <p>Your booking for <strong>${p.service}</strong> on ${p.dateLabel} ${nice}.</p>
      ${p.refundLabel ? `<p>Your deposit of <strong>${p.refundLabel}</strong> has been refunded.</p>` : ""}
      <p style="color:#666;font-size:13px">Reference: ${p.reference}</p>
    `),
  };
}

export function passwordResetEmail(p: { resetUrl: string }): EmailContent {
  return {
    subject: "Reset your password",
    html: wrap(`
      <h2 style="font-weight:600">Reset your password</h2>
      <p>We received a request to reset your password. This link expires in 1 hour.</p>
      <p style="margin:20px 0"><a href="${p.resetUrl}" style="background:#2d3b64;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Reset password</a></p>
      <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}

export function emailOtpEmail(p: {
  code: string;
  purpose: "signup" | "booking";
}): EmailContent {
  const action =
    p.purpose === "signup" ? "create your account" : "confirm your booking";
  return {
    subject: `Your verification code: ${p.code}`,
    html: wrap(`
      <h2 style="font-weight:600">Verify your email</h2>
      <p>Enter this code to ${action}. It expires in 10 minutes.</p>
      <p style="margin:24px 0;font-size:32px;font-weight:700;letter-spacing:8px;color:#2d3b64">${p.code}</p>
      <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}

export function contactNotificationEmail(p: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): EmailContent {
  return {
    subject: `New enquiry${p.subject ? `: ${p.subject}` : ""}`,
    html: wrap(`
      <h2 style="font-weight:600">New contact enquiry</h2>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">From</td><td>${p.name} &lt;${p.email}&gt;</td></tr>
        ${p.subject ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td>${p.subject}</td></tr>` : ""}
      </table>
      <p style="white-space:pre-wrap">${p.message}</p>
    `),
  };
}
