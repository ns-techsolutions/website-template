export type ErrorCode =
  | "INVALID_TOKEN"
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "TENANT_DB_NOT_MIGRATED"
  | "TENANT_DB_UNREACHABLE"
  | "INTERNAL_ERROR";

/**
 * Base class for any error that should be rendered as a clean API envelope.
 * `withApi` (lib/api/handler.ts) catches these and maps them to `errorJson`.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code: ErrorCode,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code: ErrorCode = "INVALID_TOKEN") {
    super(401, message, code);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Already exists") {
    super(409, message, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, message, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(422, message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}
