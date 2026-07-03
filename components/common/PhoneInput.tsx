"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  COUNTRIES,
  composePhone,
  findByIso,
  flagEmoji,
  resolveDefaultCountry,
  splitPhone,
} from "@/lib/phone/countries";

interface PhoneInputProps {
  /** The combined stored value, e.g. "+44 7700 900000". */
  value: string;
  /** Receives the recomposed combined value on every edit. */
  onChange: (value: string) => void;
  /** ISO-3166 alpha-2 default country (from salon settings). */
  defaultCountry?: string | null;
  placeholder?: string;
  /** Sizing/style applied to both the country trigger and the number input. */
  className?: string;
  id?: string;
  disabled?: boolean;
  /** When true, marks both halves aria-invalid so error styling (red underline) applies. */
  error?: boolean;
}

/**
 * Phone field with a country-code picker glued to a national-number input. The
 * field value stays a single string (see `lib/phone/countries`), so it drops
 * into existing react-hook-form fields whose schema is just `z.string()`.
 *
 * Built on the shared Popover + Input (the repo has no Command/cmdk), with a
 * lightweight in-popover filter for the ~100-entry country list.
 */
export function PhoneInput({
  value,
  onChange,
  defaultCountry,
  placeholder,
  className,
  id,
  disabled,
  error,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const initial = React.useMemo(
    () => splitPhone(value, defaultCountry),
    // Only seed once; later syncs are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [iso, setIso] = React.useState(initial.country.iso2);
  const [national, setNational] = React.useState(initial.national);

  const country = findByIso(iso) ?? resolveDefaultCountry(defaultCountry);

  // Re-sync from an externally changed value (e.g. form.reset after data load).
  React.useEffect(() => {
    const composed = composePhone(country.dialCode, national);
    if ((value ?? "") !== composed) {
      const parsed = splitPhone(value, defaultCountry);
      setIso(parsed.country.iso2);
      setNational(parsed.national);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Adopt the salon default once it resolves, but only while the field is empty
  // — never overwrite a value the user (or saved data) already provided.
  React.useEffect(() => {
    if (!national && !(value ?? "")) {
      setIso(resolveDefaultCountry(defaultCountry).iso2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountry]);

  function selectCountry(nextIso: string) {
    const next = findByIso(nextIso);
    if (!next) return;
    setIso(next.iso2);
    onChange(composePhone(next.dialCode, national));
    setOpen(false);
    setFilter("");
  }

  function handleNational(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only phone characters (digits + common separators); strip anything
    // else as it's typed/pasted so the stored value stays a clean number.
    const next = e.target.value.replace(/[^\d\s()\-]/g, "");
    setNational(next);
    onChange(composePhone(country.dialCode, next));
  }

  const q = filter.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  const filtered = q
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.iso2.toLowerCase().includes(q) ||
          (digits && c.dialCode.includes(digits)),
      )
    : COUNTRIES;

  return (
    <div className="flex w-full gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={error || undefined}
            aria-label={`Country code: ${country.name} (+${country.dialCode})`}
            disabled={disabled}
            className={cn("shrink-0 gap-1.5 px-2.5 font-normal", className)}
          >
            <span className="text-base leading-none">{flagEmoji(country.iso2)}</span>
            <span className="text-sm">+{country.dialCode}</span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="border-b p-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search country"
              className="h-9"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.map((c) => (
              <button
                type="button"
                key={c.iso2}
                onClick={() => selectCountry(c.iso2)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                  c.iso2 === country.iso2 && "bg-accent/50",
                )}
              >
                <span className="text-base leading-none">{flagEmoji(c.iso2)}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground">+{c.dialCode}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No countries found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        value={national}
        onChange={handleNational}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error || undefined}
        className={cn("flex-1", className)}
      />
    </div>
  );
}
