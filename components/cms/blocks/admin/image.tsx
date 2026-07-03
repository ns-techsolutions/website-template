import { cn } from "@/lib/utils"
import type { AdminBlockProps, AnyData } from "./types"
import { Img, s } from "./_shared"

export function ImageBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div
      className={cn(
        "px-6 py-8",
        d.align === "left" ? "text-left" : d.align === "right" ? "text-right" : "text-center"
      )}
    >
      {s(d.image) ? (
        <Img src={s(d.image)} className="inline-block max-h-72 rounded-2xl object-cover" />
      ) : (
        <div className="mx-auto flex h-40 max-w-md items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400">
          No image
        </div>
      )}
      {s(d.caption) && <p className="mt-2 text-xs text-neutral-500">{s(d.caption)}</p>}
    </div>
  )
}
