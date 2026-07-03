/**
 * Normalizes a host/domain to the canonical form used for tenant routing:
 * lowercase, no protocol, no path, no port, no leading `www.`. Pure (no
 * `next`/`server-only`) so it can be shared by request resolution (lib/db/tenant)
 * and the create-salon validation schema.
 *
 *   "https://www.Rein.Localhost:3000/foo" -> "rein.localhost"
 *   "localhost:3000"                       -> "localhost"
 */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return "";
  let h = host.trim().toLowerCase();
  h = h.replace(/^https?:\/\//, ""); // strip protocol
  h = h.split("/")[0]; // strip path
  h = h.split("?")[0]; // strip query
  h = h.split(":")[0]; // strip port
  h = h.replace(/^www\./, ""); // strip leading www.
  return h.trim();
}
