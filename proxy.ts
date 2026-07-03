import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Tenant routing seam (Next 16 renamed `middleware` → `proxy`).
//
// Each salon is served on its own custom domain. The app maps the request host
// to that salon's PRIVATE database in lib/db/tenant (`getTenantDb`). Per the
// Next 16 Proxy guidance we keep this light and do NOT touch the database here
// ("Proxy ... should not attempt relying on shared modules or globals"). We only
// normalize the incoming host into `x-tenant-host`, so server code has one
// reliable source for the salon even behind CDNs/load balancers that rewrite the
// `Host` header.
export function proxy(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-host", host);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Page/RSC requests only. API routes scope themselves in withApi; static
    // assets and metadata files never need tenant routing.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
