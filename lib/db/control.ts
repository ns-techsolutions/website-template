import { PrismaClient } from "./generated/control";

// The control-plane database client. This is the single shared database holding
// the Tenant registry and master admins — NOT any per-salon data. Reused across
// hot reloads in dev so we don't exhaust the connection pool.

const globalForControl = globalThis as unknown as {
  controlDb: PrismaClient | undefined;
};

export const controlDb =
  globalForControl.controlDb ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForControl.controlDb = controlDb;
}
