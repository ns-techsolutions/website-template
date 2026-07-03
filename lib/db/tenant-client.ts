import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "node:async_hooks";

// Builds and caches one PrismaClient per tenant database URL. Each salon's
// private database is reached through its own client (runtime `datasourceUrl`
// override). The cache is bounded so a long-running serverless instance that
// has served many tenants doesn't exhaust the connection pool.
//
// This module is deliberately free of `next/*` imports so provisioning/migration
// scripts (plain Node) can reuse the same factory.

const MAX_CLIENTS = 25;
const clients = new Map<string, PrismaClient>();

const log: ("error" | "warn")[] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

export function getTenantClient(databaseUrl: string): PrismaClient {
  const existing = clients.get(databaseUrl);
  if (existing) {
    // Refresh LRU recency.
    clients.delete(databaseUrl);
    clients.set(databaseUrl, existing);
    return existing;
  }

  if (clients.size >= MAX_CLIENTS) {
    const oldestKey = clients.keys().next().value;
    if (oldestKey) {
      const oldest = clients.get(oldestKey);
      clients.delete(oldestKey);
      void oldest?.$disconnect();
    }
  }

  const client = new PrismaClient({ datasourceUrl: databaseUrl, log });
  clients.set(databaseUrl, client);
  return client;
}

// Holds the active tenant database URL for the current request. Set by `withApi`
// only for the master cross-tenant override (`x-target-tenant`); the common
// path resolves the tenant from the request host instead (see getTenantDb).
const tenantUrlStore = new AsyncLocalStorage<string>();

export function runWithTenantDb<T>(databaseUrl: string, fn: () => T): T {
  return tenantUrlStore.run(databaseUrl, fn);
}

export function getActiveTenantUrl(): string | undefined {
  return tenantUrlStore.getStore();
}
