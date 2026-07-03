"use client";

import * as React from "react";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Interactive 1–5 star picker. Controlled: `value` 0 means "not yet rated". */
export function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded-sm p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <StarIcon
            className={cn(
              "size-6 transition-colors",
              n <= active
                ? "fill-[#F5B301] text-[#F5B301]"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
