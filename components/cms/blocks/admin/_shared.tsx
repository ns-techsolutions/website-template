import {
  CalendarDaysIcon,
  HeartIcon,
  LogOutIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { AnyData } from "./types"

type IconType = React.ComponentType<{ className?: string }>

export const ACCOUNT_ICONS: Record<string, IconType> = {
  User: UserRoundIcon,
  Calendar: CalendarDaysIcon,
  Heart: HeartIcon,
  Settings: SettingsIcon,
  LogOut: LogOutIcon,
}

// Simplified render of a page's blocks, styled to match the public Reine site
// (serif headings, uppercase eyebrows, pill buttons, alternating backgrounds).
// Shared by the admin editor preview and the public site.

export const s = (v: unknown) => (typeof v === "string" ? v : "")
export const arr = (v: unknown) => (Array.isArray(v) ? v : [])
export const items = (v: unknown): AnyData[] => arr(v).map((x) => x as AnyData)

export const SECONDARY = "#f6f5f3"

export function Img({ src, className }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={className} />
}

export function Eyebrow({ children, light }: { children: string; light?: boolean }) {
  if (!children) return null
  return (
    <p
      className={cn(
        "mb-2 text-[10px] font-semibold tracking-[0.19em] uppercase",
        light ? "text-white/80" : "text-neutral-400"
      )}
    >
      {children}
    </p>
  )
}

export function Heading({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  if (!children) return null
  return (
    <h3 className={cn("font-serif text-2xl text-neutral-900", className)}>
      {children}
    </h3>
  )
}

export function Pill({
  children,
  variant = "dark",
  className,
}: {
  children: string
  variant?: "dark" | "light" | "solid"
  className?: string
}) {
  if (!children) return null
  return (
    <span
      className={cn(
        "inline-block rounded-full px-6 py-2 text-[10px] font-semibold tracking-[0.18em] uppercase",
        variant === "dark" && "border border-neutral-800 text-neutral-800",
        variant === "light" && "border border-white text-white",
        variant === "solid" && "bg-neutral-900 text-white",
        className
      )}
    >
      {children}
    </span>
  )
}

export function MockInput({ className }: { className?: string }) {
  return (
    <div className={cn("h-8 border-b border-neutral-300 bg-transparent", className)} />
  )
}

export function FullButton({ children }: { children: string }) {
  return (
    <div className="w-full rounded-full bg-neutral-900 py-2.5 text-center text-[10px] font-semibold tracking-[0.18em] text-white uppercase">
      {children}
    </div>
  )
}

export function LabeledInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      {label && <p className="mb-1 text-[11px] font-medium text-neutral-600">{label}</p>}
      <div className="flex h-9 items-center rounded-md border border-neutral-300 px-3 text-xs text-neutral-400">
        {placeholder}
      </div>
    </div>
  )
}

export function AuthShell({
  image,
  children,
}: {
  image: string
  children: React.ReactNode
}) {
  if (image) {
    return (
      <div className="px-6 py-12" style={{ backgroundColor: SECONDARY }}>
        <div className="mx-auto grid max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-sm md:grid-cols-2">
          <Img src={image} className="hidden min-h-72 w-full object-cover md:block" />
          <div className="p-8">{children}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="px-6 py-12" style={{ backgroundColor: SECONDARY }}>
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">{children}</div>
    </div>
  )
}

/** Placeholder for blocks whose content is pulled live from the database. */
export function LiveDataNote({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-xs text-neutral-500">
      {children}
    </div>
  )
}
