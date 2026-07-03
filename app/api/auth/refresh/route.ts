import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/api/errors";
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from "@/lib/auth/refresh-cookie";
import { refreshTenantSessionUseCase } from "@/features/auth/business/refresh-session.usecase";

/** Silently renews the customer session from the httpOnly refresh cookie. */
export const POST = withApi(async () => {
  const rawToken = await readRefreshCookie("customer");
  if (!rawToken) throw new UnauthorizedError();

  try {
    const { refreshToken, ...result } = await refreshTenantSessionUseCase(
      rawToken,
      "customer",
    );
    await setRefreshCookie("customer", refreshToken);
    return successJson(result, { message: "Refreshed" });
  } catch (err) {
    await clearRefreshCookie("customer");
    throw err;
  }
});
