import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { NavIcon } from "./nav-items"

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  suffix,
}: {
  label: string
  value: string
  change?: number
  icon: NavIcon
  suffix?: string
}) {
  const positive = (change ?? 0) >= 0

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            {value}
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
              positive
                ? "bg-[#E6F4EA] text-[#1E7E34]"
                : "bg-[#FDECEC] text-[#D32F2F]"
            )}
          >
            {positive ? (
              <ArrowUpRightIcon className="size-3" />
            ) : (
              <ArrowDownRightIcon className="size-3" />
            )}
            {Math.abs(change)}
            {suffix ?? "%"}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </Card>
  )
}
