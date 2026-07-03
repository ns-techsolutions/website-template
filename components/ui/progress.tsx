"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  value = 0,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full bg-primary transition-[width] duration-200 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
