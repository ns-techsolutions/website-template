import { cn } from "@/lib/utils"
import type { PublicBlockProps, AnyData } from "./types"
import { Img, s } from "./_shared"

export function ImageBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-12 md:py-16">
      <div
        className={cn(
          "reine-container",
          d.align === "left" ? "text-left" : d.align === "right" ? "text-right" : "text-center",
        )}
      >
        <Img
          src={s(d.image)}
          className="inline-block max-h-[640px] w-full rounded-3xl object-cover"
        />
        {s(d.caption) && (
          <p className="mt-3 text-sm text-muted-foreground">{s(d.caption)}</p>
        )}
      </div>
    </section>
  )
}
