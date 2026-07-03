/**
 * Self-contained country dial-code dataset for the phone-number inputs. We keep
 * only the ISO-3166 alpha-2 code, display name, and E.164 dial code here — the
 * flag is derived from the code (see `flagEmoji`) so there is nothing to keep in
 * sync. No external dependency: the storefront stores a phone as a single
 * combined string (e.g. "+44 7700 900000"), so the country select is purely a
 * presentation/entry aid layered on top of the existing free-text `phone` field.
 */

export interface Country {
  /** ISO-3166 alpha-2 code, uppercase (e.g. "GB"). */
  iso2: string;
  name: string;
  /** E.164 country calling code, digits only, no "+" (e.g. "44"). */
  dialCode: string;
}

/** Fallback default when no salon-level default is configured. */
export const DEFAULT_PHONE_COUNTRY = "GB";

// Ordered roughly by likely usage, then alphabetical. Several territories share
// a dial code (the "+1" NANP block in particular); `splitPhone` resolves an
// ambiguous prefix to the first listed entry, which is the intended default.
export const COUNTRIES: Country[] = [
  { iso2: "GB", name: "United Kingdom", dialCode: "44" },
  { iso2: "US", name: "United States", dialCode: "1" },
  { iso2: "CA", name: "Canada", dialCode: "1" },
  { iso2: "IE", name: "Ireland", dialCode: "353" },
  { iso2: "AU", name: "Australia", dialCode: "61" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64" },
  { iso2: "IN", name: "India", dialCode: "91" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso2: "AF", name: "Afghanistan", dialCode: "93" },
  { iso2: "AL", name: "Albania", dialCode: "355" },
  { iso2: "DZ", name: "Algeria", dialCode: "213" },
  { iso2: "AR", name: "Argentina", dialCode: "54" },
  { iso2: "AM", name: "Armenia", dialCode: "374" },
  { iso2: "AT", name: "Austria", dialCode: "43" },
  { iso2: "AZ", name: "Azerbaijan", dialCode: "994" },
  { iso2: "BH", name: "Bahrain", dialCode: "973" },
  { iso2: "BD", name: "Bangladesh", dialCode: "880" },
  { iso2: "BY", name: "Belarus", dialCode: "375" },
  { iso2: "BE", name: "Belgium", dialCode: "32" },
  { iso2: "BO", name: "Bolivia", dialCode: "591" },
  { iso2: "BA", name: "Bosnia and Herzegovina", dialCode: "387" },
  { iso2: "BR", name: "Brazil", dialCode: "55" },
  { iso2: "BG", name: "Bulgaria", dialCode: "359" },
  { iso2: "KH", name: "Cambodia", dialCode: "855" },
  { iso2: "CM", name: "Cameroon", dialCode: "237" },
  { iso2: "CL", name: "Chile", dialCode: "56" },
  { iso2: "CN", name: "China", dialCode: "86" },
  { iso2: "CO", name: "Colombia", dialCode: "57" },
  { iso2: "CR", name: "Costa Rica", dialCode: "506" },
  { iso2: "HR", name: "Croatia", dialCode: "385" },
  { iso2: "CY", name: "Cyprus", dialCode: "357" },
  { iso2: "CZ", name: "Czechia", dialCode: "420" },
  { iso2: "DK", name: "Denmark", dialCode: "45" },
  { iso2: "DO", name: "Dominican Republic", dialCode: "1" },
  { iso2: "EC", name: "Ecuador", dialCode: "593" },
  { iso2: "EG", name: "Egypt", dialCode: "20" },
  { iso2: "EE", name: "Estonia", dialCode: "372" },
  { iso2: "ET", name: "Ethiopia", dialCode: "251" },
  { iso2: "FI", name: "Finland", dialCode: "358" },
  { iso2: "FR", name: "France", dialCode: "33" },
  { iso2: "GE", name: "Georgia", dialCode: "995" },
  { iso2: "DE", name: "Germany", dialCode: "49" },
  { iso2: "GH", name: "Ghana", dialCode: "233" },
  { iso2: "GR", name: "Greece", dialCode: "30" },
  { iso2: "GT", name: "Guatemala", dialCode: "502" },
  { iso2: "HK", name: "Hong Kong", dialCode: "852" },
  { iso2: "HU", name: "Hungary", dialCode: "36" },
  { iso2: "IS", name: "Iceland", dialCode: "354" },
  { iso2: "ID", name: "Indonesia", dialCode: "62" },
  { iso2: "IQ", name: "Iraq", dialCode: "964" },
  { iso2: "IL", name: "Israel", dialCode: "972" },
  { iso2: "IT", name: "Italy", dialCode: "39" },
  { iso2: "JM", name: "Jamaica", dialCode: "1" },
  { iso2: "JP", name: "Japan", dialCode: "81" },
  { iso2: "JO", name: "Jordan", dialCode: "962" },
  { iso2: "KZ", name: "Kazakhstan", dialCode: "7" },
  { iso2: "KE", name: "Kenya", dialCode: "254" },
  { iso2: "KW", name: "Kuwait", dialCode: "965" },
  { iso2: "LV", name: "Latvia", dialCode: "371" },
  { iso2: "LB", name: "Lebanon", dialCode: "961" },
  { iso2: "LT", name: "Lithuania", dialCode: "370" },
  { iso2: "LU", name: "Luxembourg", dialCode: "352" },
  { iso2: "MO", name: "Macao", dialCode: "853" },
  { iso2: "MY", name: "Malaysia", dialCode: "60" },
  { iso2: "MT", name: "Malta", dialCode: "356" },
  { iso2: "MX", name: "Mexico", dialCode: "52" },
  { iso2: "MD", name: "Moldova", dialCode: "373" },
  { iso2: "MC", name: "Monaco", dialCode: "377" },
  { iso2: "MA", name: "Morocco", dialCode: "212" },
  { iso2: "NP", name: "Nepal", dialCode: "977" },
  { iso2: "NL", name: "Netherlands", dialCode: "31" },
  { iso2: "NG", name: "Nigeria", dialCode: "234" },
  { iso2: "NO", name: "Norway", dialCode: "47" },
  { iso2: "OM", name: "Oman", dialCode: "968" },
  { iso2: "PK", name: "Pakistan", dialCode: "92" },
  { iso2: "PA", name: "Panama", dialCode: "507" },
  { iso2: "PY", name: "Paraguay", dialCode: "595" },
  { iso2: "PE", name: "Peru", dialCode: "51" },
  { iso2: "PH", name: "Philippines", dialCode: "63" },
  { iso2: "PL", name: "Poland", dialCode: "48" },
  { iso2: "PT", name: "Portugal", dialCode: "351" },
  { iso2: "QA", name: "Qatar", dialCode: "974" },
  { iso2: "RO", name: "Romania", dialCode: "40" },
  { iso2: "RU", name: "Russia", dialCode: "7" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso2: "RS", name: "Serbia", dialCode: "381" },
  { iso2: "SG", name: "Singapore", dialCode: "65" },
  { iso2: "SK", name: "Slovakia", dialCode: "421" },
  { iso2: "SI", name: "Slovenia", dialCode: "386" },
  { iso2: "ZA", name: "South Africa", dialCode: "27" },
  { iso2: "KR", name: "South Korea", dialCode: "82" },
  { iso2: "ES", name: "Spain", dialCode: "34" },
  { iso2: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso2: "SE", name: "Sweden", dialCode: "46" },
  { iso2: "CH", name: "Switzerland", dialCode: "41" },
  { iso2: "TW", name: "Taiwan", dialCode: "886" },
  { iso2: "TZ", name: "Tanzania", dialCode: "255" },
  { iso2: "TH", name: "Thailand", dialCode: "66" },
  { iso2: "TN", name: "Tunisia", dialCode: "216" },
  { iso2: "TR", name: "Türkiye", dialCode: "90" },
  { iso2: "UG", name: "Uganda", dialCode: "256" },
  { iso2: "UA", name: "Ukraine", dialCode: "380" },
  { iso2: "UY", name: "Uruguay", dialCode: "598" },
  { iso2: "UZ", name: "Uzbekistan", dialCode: "998" },
  { iso2: "VE", name: "Venezuela", dialCode: "58" },
  { iso2: "VN", name: "Vietnam", dialCode: "84" },
  { iso2: "YE", name: "Yemen", dialCode: "967" },
  { iso2: "ZM", name: "Zambia", dialCode: "260" },
  { iso2: "ZW", name: "Zimbabwe", dialCode: "263" },
];

const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso2.toUpperCase(), c]));

/** Look up a country by ISO-3166 alpha-2 code (case-insensitive). */
export function findByIso(iso2: string | null | undefined): Country | undefined {
  if (!iso2) return undefined;
  return BY_ISO.get(iso2.toUpperCase());
}

/**
 * Regional-indicator flag emoji for an ISO alpha-2 code. On platforms without
 * flag-emoji glyphs (e.g. Windows) this degrades to the two-letter code, which
 * is still a useful country hint alongside the dial code.
 */
export function flagEmoji(iso2: string): string {
  const code = iso2.toUpperCase();
  if (code.length !== 2) return "";
  return String.fromCodePoint(
    ...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}

/** Resolve the default country: a configured value, else `DEFAULT_PHONE_COUNTRY`. */
export function resolveDefaultCountry(iso2?: string | null): Country {
  return findByIso(iso2) ?? findByIso(DEFAULT_PHONE_COUNTRY) ?? COUNTRIES[0];
}

/**
 * Split a stored phone string into its country + national parts. A leading
 * "+<dial>" is matched against the longest known dial code; without a "+", the
 * whole value is treated as the national number under `defaultIso`. Separators
 * the user typed in the national portion are preserved.
 */
export function splitPhone(
  value: string | null | undefined,
  defaultIso?: string | null,
): { country: Country; national: string } {
  const fallback = resolveDefaultCountry(defaultIso);
  const raw = (value ?? "").trim();
  if (!raw.startsWith("+")) {
    return { country: fallback, national: raw };
  }

  const rest = raw.slice(1);
  const digits = rest.replace(/\D/g, "");

  // Longest matching dial code wins (so "+1" doesn't shadow a "+1xx" entry).
  let match: Country | undefined;
  for (const c of COUNTRIES) {
    if (digits.startsWith(c.dialCode)) {
      if (!match || c.dialCode.length > match.dialCode.length) match = c;
    }
  }
  if (!match) {
    return { country: fallback, national: rest.trim() };
  }

  // Consume `dialCode.length` digits from `rest`, keeping the remaining
  // characters (including separators) as the national number.
  let consumed = 0;
  let i = 0;
  for (; i < rest.length && consumed < match.dialCode.length; i++) {
    if (/\d/.test(rest[i])) consumed++;
  }
  return { country: match, national: rest.slice(i).trim() };
}

/**
 * Compose a stored phone string from a dial code + national number. Returns ""
 * when there is no national number so an untouched optional field stays empty
 * (rather than persisting a bare "+44").
 */
export function composePhone(dialCode: string, national: string): string {
  const trimmed = national.trim();
  if (!trimmed) return "";
  return `+${dialCode} ${trimmed}`;
}
