import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { emailOtpService } from "@/features/email-otp/services/email-otp.service";

// Request an email verification code for signup or a guest booking. Public —
// the tenant is resolved from the request host like the other public routes.
export const POST = withApi(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const result = await emailOtpService.requestOtp(body);
  return successJson(result, { message: "Verification code sent" });
});
