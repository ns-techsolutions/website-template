import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

import { DEFAULT_PHONE_COUNTRY } from "./countries";
import type { CountryCode } from "libphonenumber-js";

const PHONE_MESSAGE = "Enter a valid phone number";

/**
 * Validates a stored phone string (e.g. "+44 7700 900000") with
 * `libphonenumber-js`, which checks the actual per-country numbering plans
 * (length + prefix), not just a digit count. Values entered through `PhoneInput`
 * always carry a "+<dial>" prefix so the country is self-describing; a
 * `defaultCountry` fallback covers any bare legacy value.
 */
export function isValidPhone(value: string, defaultCountry?: string): boolean {
  const country = (defaultCountry ?? DEFAULT_PHONE_COUNTRY) as CountryCode;
  try {
    return isValidPhoneNumber(value, country);
  } catch {
    return false;
  }
}

/** Optional phone: blank is allowed, but any provided value must be valid. */
export const optionalPhone = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhone(v), { message: PHONE_MESSAGE });

/** Optional phone that normalizes blank to `undefined` (for server payloads). */
export const optionalPhoneOrUndefined = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || isValidPhone(v), { message: PHONE_MESSAGE });

/** Required phone: must be present and valid. */
export const requiredPhone = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((v) => isValidPhone(v), { message: PHONE_MESSAGE });
