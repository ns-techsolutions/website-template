import { NextResponse } from "next/server";

/**
 * The single response envelope every API route returns.
 *
 *   success: { statusCode, status: true,  message, data: <payload> }
 *   error:   { statusCode, status: false, message, data: { message, code } }
 */
export interface ApiResponse<T> {
  statusCode: number;
  status: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  message: string;
  code: string;
  details?: unknown;
}

export function successJson<T>(
  data: T,
  init?: { status?: number; message?: string },
): NextResponse<ApiResponse<T>> {
  const statusCode = init?.status ?? 200;
  const body: ApiResponse<T> = {
    statusCode,
    status: true,
    message: init?.message ?? "OK",
    data,
  };
  return NextResponse.json(body, { status: statusCode });
}

export function errorJson(
  statusCode: number,
  message: string,
  code: string,
  details?: unknown,
): NextResponse<ApiResponse<ApiErrorBody>> {
  const data: ApiErrorBody = { message, code };
  if (details !== undefined) data.details = details;
  const body: ApiResponse<ApiErrorBody> = {
    statusCode,
    status: false,
    message,
    data,
  };
  return NextResponse.json(body, { status: statusCode });
}
