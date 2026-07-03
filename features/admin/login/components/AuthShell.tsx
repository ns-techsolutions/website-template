import type { ReactNode } from "react"
import { CheckIcon } from "lucide-react"

import { AdminLogo } from "@/components/admin/admin-logo"

const highlights = [
  "Track appointments and revenue in real time",
  "Manage staff, roles and leave from one place",
  "Build your service menu and opening hours",
]

/**
 * Shared two-panel layout for the admin auth pages (login, forgot/reset
 * password) — brand panel on the left, a form slot on the right. Mirrors the
 * sign-in screen so the whole flow looks of a piece.
 */
export function AuthShell({
  brandName,
  isPlatform = false,
  children,
}: {
  brandName: string
  isPlatform?: boolean
  children: ReactNode
}) {
  const initial = brandName.charAt(0).toUpperCase()
  const description = isPlatform
    ? "Manage every salon on the platform — tenants, plans and master settings — from one console."
    : `Everything you need to run ${brandName} — bookings, services, staff and insights — in one calm, organised dashboard.`

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 120% at 0% 0%, #3a4a7d 0%, #2d3b64 45%, #232e4f 100%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 font-heading text-lg font-semibold">
            {initial}
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            {brandName}
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="font-heading text-4xl leading-tight font-semibold">
            Manage your salon, beautifully.
          </h1>
          <p className="text-base text-white/75">{description}</p>
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon className="size-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <AdminLogo href="/admin/login" brandName={brandName} />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
