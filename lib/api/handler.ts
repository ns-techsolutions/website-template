import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { runWithTenantDb } from "@/lib/db/tenant-client";
import { resolveMasterTargetUrl } from "@/lib/db/tenant";

import { AppError } from "./errors";
import { errorJson } from "./response";

type RouteHandler<C> = (req: NextRequest, ctx: C) => Promise<Response> | Response;

/**
 * Wraps a route handler so every thrown error becomes the standard envelope:
 *   - AppError  -> its own statusCode/message/code
 *   - ZodError  -> 422 VALIDATION_ERROR (with flattened field errors)
 *   - anything else -> 500 INTERNAL_ERROR
 *
 * It also installs the request's salon scope: when an authenticated master
 * targets a salon (`x-target-tenant`), the handler (and every repository it
 * calls via `getTenantDb`) is run against that salon's database. The common
 * case — a salon's own domain — needs nothing here; `getTenantDb` resolves it
 * from the request host.
 *
 * Usage:
 *   export const GET = withApi(async (req) => successJson(...))
 *   export const GET = withApi<{ params: Promise<{ id: string }> }>(async (req, ctx) => ...)
 */
export function withApi<C = unknown>(fn: RouteHandler<C>) {
  return async (req: NextRequest, ctx: C): Promise<Response> => {
    try {
      const targetUrl = await resolveMasterTargetUrl(req);
      if (targetUrl) {
        return await runWithTenantDb(targetUrl, () => fn(req, ctx));
      }
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return errorJson(err.statusCode, err.message, err.code, err.details);
      }
      if (err instanceof ZodError) {
        return errorJson(
          422,
          "Validation failed",
          "VALIDATION_ERROR",
          err.flatten(),
        );
      }
      console.error("[api] Unhandled error:", err);
      return errorJson(500, "Internal Server Error", "INTERNAL_ERROR");
    }
  };
}
