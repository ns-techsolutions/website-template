import type { AdminBlockProps, AnyData } from "./types"
import { items, s } from "./_shared"

export function StatsBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-neutral-900 px-6 py-10 text-center text-white">
      {s(d.heading) && <h3 className="mb-6 font-serif text-xl">{s(d.heading)}</h3>}
      <div className="flex flex-wrap justify-center gap-10">
        {items(d.items).map((item, i) => (
          <div key={i}>
            <p className="font-serif text-3xl">{s(item.value)}</p>
            <p className="mt-1 text-[10px] tracking-wide uppercase text-white/70">
              {s(item.label)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
