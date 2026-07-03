import Link from "next/link"

import { cn } from "@/lib/utils"

export function AdminLogo({
  className,
  href = "/admin/dashboard",
  brandName = "Admin",
}: {
  className?: string
  href?: string
  brandName?: string
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-heading text-lg font-semibold text-primary-foreground">
        {brandName.charAt(0).toUpperCase()}
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {brandName}
        </span>
        <span className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Admin
        </span>
      </span>
    </Link>
  )
}
