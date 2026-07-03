import { cn } from "@/lib/utils"
import type { PublicBlockProps, AnyData } from "./types"
import { Btn, s } from "./_shared"

export function HeroBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  const compact = d.size === "compact"
  const h = compact ? "min-h-[60vh]" : "min-h-[86vh]"
  return (
    <section
      className={cn("relative isolate overflow-hidden bg-neutral-900", h)}
      style={
        s(d.image)
          ? {
              backgroundImage: `url('${s(d.image)}')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-[#1f0d0a]/40" />
      <div
        className={cn(
          "reine-container relative z-10 flex flex-col items-center justify-center pt-24 pb-20 text-center text-white lg:pt-30",
          h,
        )}
      >
        {s(d.eyebrow) && (
          <p className="mb-4 text-sm font-bold tracking-[0.2em] uppercase text-white/80">
            {s(d.eyebrow)}
          </p>
        )}
        <p className="mb-4 max-w-[18ch] font-heading text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.95] uppercase">
          {s(d.title)}
        </p>
        {s(d.subtitle) && (
          <h2 className="mb-11 text-[clamp(1.3rem,2.4vw,2.85rem)] tracking-[0.085em] uppercase">
            {s(d.subtitle)}
          </h2>
        )}
        <Btn label={d.buttonLabel} url={d.buttonUrl} variant="light" className="min-w-52" />
      </div>
    </section>
  )
}
