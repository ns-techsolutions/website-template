import { cn } from "@/lib/utils"
import { formatTime12 } from "@/lib/admin/format"
import type { OpeningHour } from "@/lib/admin/types"
import type { AnyData } from "./types"

// Full-fidelity public renderer helpers: reproduce the hand-built Reine section
// styles (reine-container, full-bleed hero, original aspect ratios, pill
// buttons) but driven entirely by CMS block data. Shared by the per-block
// components under ./blocks/public.

export const s = (v: unknown) => (typeof v === "string" ? v : "")
export const arr = (v: unknown) => (Array.isArray(v) ? v : [])
export const items = (v: unknown): AnyData[] => arr(v).map((x) => x as AnyData)

export function Eyebrow({ children }: { children: string }) {
  if (!children) return null
  return <p className="reine-eyebrow mb-4">{children}</p>
}

export function Btn({
  label,
  url,
  variant = "dark",
  className,
}: {
  label: unknown
  url?: unknown
  variant?: "dark" | "light"
  className?: string
}) {
  const text = s(label)
  if (!text) return null
  return (
    <a
      href={s(url) || "#"}
      className={cn(
        "reine-btn",
        variant === "light" ? "reine-btn-light" : "reine-btn-dark",
        className,
      )}
    >
      {text}
    </a>
  )
}

export function Img({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  if (!src) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ""} className={className} />
}

/** "Monday" + 09:00/17:00 → { label: "Monday", value: "9:00 AM - 5:00 PM" }. */
export function hoursRow(h: OpeningHour) {
  return {
    label: h.day,
    value: h.closed ? "Closed" : `${formatTime12(h.open)} - ${formatTime12(h.close)}`,
  }
}
