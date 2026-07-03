import "server-only";

import type { NextRequest } from "next/server";

// Proxies may send a comma-separated list (`x-forwarded-host: client, proxy`);
// the first entry is the original client-facing value.
function first(value: string | null): string {
  return value?.split(",")[0]?.trim() ?? "";
}

/**
 * The public origin (scheme + host[:port]) the browser actually used, derived
 * from the proxy's forwarding headers — the same host chain `getTenantDb()`
 * trusts for tenant routing (see lib/db/tenant.ts and proxy.ts).
 *
 * Use this — NOT `req.nextUrl.origin` — when building absolute URLs handed back
 * to users (Stripe success/cancel redirects, password-reset links, etc.).
 * Behind nginx / Cloud Run the app binds to an internal address, so
 * `req.nextUrl.origin` resolves to e.g. `http://0.0.0.0:8080` instead of the
 * salon's real public domain.
 */
export function publicOrigin(req: NextRequest): string {
  const host = first(req.headers.get("x-forwarded-host")) || first(req.headers.get("host"));
  if (!host) return req.nextUrl.origin; // direct / non-proxied request

  const proto =
    first(req.headers.get("x-forwarded-proto")) ||
    (process.env.NODE_ENV === "production"
      ? "https"
      : req.nextUrl.protocol.replace(/:$/, ""));

  return `${proto}://${host}`;
}
