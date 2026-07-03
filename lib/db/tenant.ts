import "server-only";

import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";

import { decryptSecret } from "@/lib/crypto/secret";
import { getOptionalMasterUser } from "@/lib/auth/get-master-user";
import { normalizeHost } from "@/lib/net/host";

import { controlDb } from "./control";
import { getActiveTenantUrl, getTenantClient } from "./tenant-client";

export { normalizeHost };

const TARGET_HEADER = "x-target-tenant";
const REGISTRY_TTL_MS = 30_000;

/** The host the platform/master console is served on (everything else is a salon). */
export function platformHost(): string {
  return normalizeHost(process.env.PLATFORM_HOST ?? "localhost");
}

export function isPlatformHost(host: string | null | undefined): boolean {
  return normalizeHost(host) === platformHost();
}

/** Brand name shown on the platform console (master login, etc.). */
export function platformBrandName(): string {
  return process.env.PLATFORM_BRAND_NAME ?? "NS Solutions";
}

interface Registry {
  id: string;
  /** Decrypted connection string. */
  databaseUrl: string;
}

// Short-TTL cache so we don't hit the control-plane on every request. Holds the
// already-decrypted URL — server-only module, never serialized to the client.
const hostCache = new Map<string, { value: Registry | null; expires: number }>();

async function lookup(host: string): Promise<Registry | null> {
  const t = await controlDb.tenant.findFirst({
    where: { domain: host, status: "active" },
    select: { id: true, databaseUrl: true },
  });
  return t ? { id: t.id, databaseUrl: decryptSecret(t.databaseUrl) } : null;
}

async function primaryTenant(): Promise<Registry | null> {
  const t = await controlDb.tenant.findFirst({
    where: { isPrimary: true },
    select: { id: true, databaseUrl: true },
  });
  return t ? { id: t.id, databaseUrl: decryptSecret(t.databaseUrl) } : null;
}

/** Resolves the salon (registry id + decrypted DB url) mapped to a request host. */
export async function resolveTenantByHost(
  host: string | null | undefined,
): Promise<Registry | null> {
  const key = normalizeHost(host);
  const now = Date.now();
  const hit = hostCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  let value: Registry | null = null;
  if (key && !isPlatformHost(key)) {
    value = await lookup(key);
    // Dev convenience: an unknown, non-platform host falls back to the primary
    // salon so you can develop without wiring real domains. Never in production.
    if (!value && process.env.NODE_ENV !== "production") {
      value = await primaryTenant();
    }
  }

  hostCache.set(key, { value, expires: now + REGISTRY_TTL_MS });
  return value;
}

/** Drop cached host→tenant entries (call after registering/editing a tenant). */
export function invalidateTenantHostCache(host?: string): void {
  if (host) hostCache.delete(normalizeHost(host));
  else hostCache.clear();
}

/**
 * The Prisma client for the salon this request belongs to. Resolution order:
 *   1. an explicit master override set on the request (AsyncLocalStorage), then
 *   2. the request host → Tenant registry → that salon's private database.
 *
 * Repositories call this instead of importing a global client, which is what
 * guarantees one request can only ever touch one salon's database.
 */
export async function getTenantDb(): Promise<PrismaClient> {
  const override = getActiveTenantUrl();
  if (override) return getTenantClient(override);

  const h = await headers();
  // `x-tenant-host` is set by proxy.ts; the others cover API routes (proxy is
  // skipped there) and direct/non-proxied requests.
  const host =
    h.get("x-tenant-host") ?? h.get("x-forwarded-host") ?? h.get("host");
  if (isPlatformHost(host)) {
    throw new Error(
      "No salon selected: the platform host has no tenant database. " +
        "Use a salon domain, or as master select a salon.",
    );
  }

  const reg = await resolveTenantByHost(host);
  if (!reg) {
    throw new Error(
      `No active salon is mapped to host "${normalizeHost(host)}".`,
    );
  }
  return getTenantClient(reg.databaseUrl);
}

/**
 * If the request is an authenticated master targeting a specific salon
 * (`x-target-tenant` header), returns that salon's decrypted DB url; otherwise
 * null. Only honored for masters — a tenant/customer cannot escalate.
 */
export async function resolveMasterTargetUrl(
  req: NextRequest,
): Promise<string | null> {
  const target = req.headers.get(TARGET_HEADER)?.trim();
  if (!target) return null;

  const master = await getOptionalMasterUser(req);
  if (!master) return null;

  const t = await controlDb.tenant.findUnique({
    where: { id: target },
    select: { databaseUrl: true },
  });
  return t ? decryptSecret(t.databaseUrl) : null;
}
