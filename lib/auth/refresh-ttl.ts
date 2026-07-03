/** Parses a simple duration string ("30d", "12h", "15m", "45s") to milliseconds. */
function parseDurationMs(value: string, fallbackMs: number): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;
  const n = Number(match[1]);
  const unit = match[2];
  const factor =
    unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * factor;
}

const THIRTY_DAYS_MS = 30 * 86_400_000;

/** Refresh-token lifetime in milliseconds (env `JWT_REFRESH_TTL`, default 30d). */
export function refreshTtlMs(): number {
  return parseDurationMs(process.env.JWT_REFRESH_TTL ?? "30d", THIRTY_DAYS_MS);
}

/** Absolute expiry for a newly-issued refresh token — used for the DB row. */
export function refreshExpiresAt(): Date {
  return new Date(Date.now() + refreshTtlMs());
}
