import { Badge } from "@/components/ui/badge"
import type { BadgeProps } from "@/components/ui/badge"

type Variant = NonNullable<BadgeProps["variant"]>

const STATUS_MAP: Record<string, { label: string; variant: Variant }> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "secondary" },
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  "no-show": { label: "No-show", variant: "secondary" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  trial: { label: "Trial", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "secondary" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    variant: "secondary" as Variant,
  }
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  )
}
