import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { clearRefreshCookie, readRefreshCookie } from "@/lib/auth/refresh-cookie";
import { logoutTenantUseCase } from "@/features/auth/business/refresh-session.usecase";

/** Revokes the customer refresh token and clears its cookie. */
export const POST = withApi(async () => {
  const rawToken = await readRefreshCookie("customer");
  await logoutTenantUseCase(rawToken);
  await clearRefreshCookie("customer");
  return successJson(null, { message: "Signed out" });
});
