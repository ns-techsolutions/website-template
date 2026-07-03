import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Read-only 5-star rating display. */
export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={cn(
            "size-4",
            n <= rating
              ? "fill-[#F5B301] text-[#F5B301]"
              : "fill-transparent text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
