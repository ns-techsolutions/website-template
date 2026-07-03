// Resolving a booking's wall-clock time (a "yyyy-MM-dd" date + "HH:mm" string in
// the salon's IANA timezone) to a real UTC instant — used by the cancellation /
// refund window. Hour-level precision is plenty for a cutoff policy, so we use the
// standard one-shot Intl offset trick rather than pulling in a tz library.

/** Milliseconds the timezone is ahead of UTC at the given instant. */
function tzOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(instant)) map[p.type] = p.value;
  const hour = map.hour === "24" ? "00" : map.hour; // some engines emit "24" at midnight
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - instant.getTime();
}

/**
 * The UTC instant at which a booking starts, given its stored "yyyy-MM-dd" date,
 * "HH:mm" time and the salon timezone. Returns `null` for malformed input.
 */
export function appointmentInstant(
  dateStr: string,
  time: string,
  timeZone: string,
): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  const timeParts = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateParts || !timeParts) return null;

  const [, y, mo, d] = dateParts.map(Number);
  const [, hh, mm] = timeParts.map(Number);

  const naiveUtc = Date.UTC(y, mo - 1, d, hh, mm);
  // Offset at roughly the right instant; one pass is accurate except in the brief
  // DST-transition hour, which is immaterial for a cancellation cutoff.
  const offset = tzOffsetMs(new Date(naiveUtc), timeZone);
  return new Date(naiveUtc - offset);
}
