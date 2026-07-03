import { cn } from "@/lib/utils"
import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Img, Pill, s } from "./_shared"

export function HeroBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  const full = d.size === "full"
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-neutral-800 px-6 text-center text-white",
        full ? "min-h-80 py-16" : "min-h-48 py-10"
      )}
    >
      {s(d.image) && (
        <Img src={s(d.image)} className="absolute inset-0 size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-[#1f0d0a]/50" />
      <div className="relative z-10 space-y-3">
        <Eyebrow light>{s(d.eyebrow)}</Eyebrow>
        <h2
          className={cn(
            "font-serif uppercase",
            full ? "text-4xl leading-[0.98]" : "text-3xl"
          )}
        >
          {s(d.title)}
        </h2>
        {s(d.subtitle) && (
          <p className="text-xs tracking-[0.18em] uppercase text-white/90">
            {s(d.subtitle)}
          </p>
        )}
        {s(d.buttonLabel) && (
          <div className="pt-3">
            <Pill variant="light">{s(d.buttonLabel)}</Pill>
          </div>
        )}
      </div>
    </div>
  )
}
