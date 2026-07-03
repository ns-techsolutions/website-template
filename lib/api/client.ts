"use client";

import axios, { type AxiosResponse } from "axios";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store";
import type { AuthResult } from "@/features/auth/types/auth.dto";
import type { ApiResponse } from "./response";

export class ApiClientError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Single axios instance for all client-side calls. We never let axios throw on
// HTTP status — every response carries the standard envelope, which we unwrap.
// Content-Type is set per request so FormData uploads keep their multipart
// boundary (set by the browser).
const http = axios.create({
  validateStatus: () => true,
});

/** Which auth surface a request belongs to — selects the token store + the
 *  refresh endpoint. The two are fully separate sessions. */
type AuthScope = "customer" | "admin";

/** `auth: true` is the customer scope; admin callers pass `auth: "admin"`. */
type AuthOption = boolean | AuthScope;

interface FetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Attach the stored bearer token. `true`/`"customer"` = customer, `"admin"` = admin. */
  auth?: AuthOption;
  query?: Record<string, string | undefined>;
  /** Extra request headers (e.g. `x-target-tenant` for a master targeting a salon). */
  headers?: Record<string, string>;
  /**
   * When the body is a `FormData`, skip the JSON `Content-Type` so the browser
   * sets the correct multipart boundary. Used by media uploads.
   */
  isFormData?: boolean;
  /**
   * Called with the upload completion percent (0–100) as the request body is
   * sent. Driven by axios; used for media-upload progress UI.
   */
  onUploadProgress?: (percent: number) => void;
}

function scopeOf(auth: AuthOption | undefined): AuthScope | null {
  if (auth === "admin") return "admin";
  if (auth === true || auth === "customer") return "customer";
  return null;
}

function storeFor(scope: AuthScope) {
  return scope === "admin" ? useAdminAuthStore : useAuthStore;
}

const REFRESH_PATH: Record<AuthScope, string> = {
  customer: "/api/auth/refresh",
  admin: "/api/admin/auth/refresh",
};

// One refresh in flight per scope: concurrent 401s share a single round-trip.
const refreshInFlight: Record<AuthScope, Promise<string | null> | null> = {
  customer: null,
  admin: null,
};

/**
 * Renews a scope's access token from its httpOnly refresh cookie (sent
 * automatically — path-scoped per scope). Updates the scope's store on success,
 * clears it on a definitive failure. Returns the new access token, or null.
 * Exported so AuthProvider / AdminGuard can bootstrap a session on mount.
 */
export function refreshScope(scope: AuthScope): Promise<string | null> {
  if (refreshInFlight[scope]) return refreshInFlight[scope] as Promise<string | null>;

  const run = (async (): Promise<string | null> => {
    let res: AxiosResponse<ApiResponse<AuthResult>>;
    try {
      res = await http.post<ApiResponse<AuthResult>>(REFRESH_PATH[scope]);
    } catch {
      // Network/transport failure — leave the session as-is so a later call can retry.
      return null;
    }
    const json = res.data;
    if (!json || json.status === false) {
      // The cookie was missing/expired/revoked — this session is over.
      storeFor(scope).getState().clearAuth();
      return null;
    }
    storeFor(scope).getState().setAuth(json.data.user, json.data.token);
    return json.data.token;
  })();

  refreshInFlight[scope] = run;
  void run.finally(() => {
    refreshInFlight[scope] = null;
  });
  return run;
}

function toClientError(
  payload: ApiResponse<unknown> | null | undefined,
  fallbackStatus: number,
): ApiClientError {
  const errData = (payload?.data ?? {}) as { message?: string; code?: string };
  return new ApiClientError(
    payload?.message || errData.message || "Request failed",
    errData.code || "ERROR",
    payload?.statusCode || fallbackStatus,
  );
}

/**
 * Same-origin request helper (axios) that speaks the standard envelope:
 * unwraps `data` on success, throws `ApiClientError` (message + code) on failure.
 * On a 401 for an authed request it transparently refreshes the scope's access
 * token (single-flight) and retries once.
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, auth, query, isFormData, onUploadProgress } =
    options;
  const scope = scopeOf(auth);

  function send(): Promise<AxiosResponse<ApiResponse<T>>> {
    const headers: Record<string, string> = { ...options.headers };
    if (scope) {
      const token = storeFor(scope).getState().token;
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    // JSON by default; for FormData we omit Content-Type so the browser adds the
    // correct multipart boundary.
    if (!isFormData && headers["Content-Type"] === undefined) {
      headers["Content-Type"] = "application/json";
    }
    return http.request<ApiResponse<T>>({
      url: path,
      method,
      data: body,
      params: query,
      headers,
      onUploadProgress: onUploadProgress
        ? (e) =>
            onUploadProgress(
              Math.round((e.loaded / (e.total || e.loaded || 1)) * 100),
            )
        : undefined,
    });
  }

  let res: AxiosResponse<ApiResponse<T>>;
  try {
    res = await send();
  } catch (err) {
    // Only network/transport failures land here (validateStatus accepts all).
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiClientError(message, "NETWORK_ERROR", 0);
  }

  // Access token expired/missing? Silently refresh from the cookie and retry once.
  if (res.status === 401 && scope) {
    const newToken = await refreshScope(scope);
    if (newToken) {
      try {
        res = await send();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        throw new ApiClientError(message, "NETWORK_ERROR", 0);
      }
    }
  }

  const json = res.data;
  if (!json || json.status === false) {
    throw toClientError(json, res.status);
  }
  return json.data as T;
}
