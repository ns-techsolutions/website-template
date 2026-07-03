import type { PublicBlockProps, AnyData } from "./types"
import { items, s } from "./_shared"

export function StatsBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-neutral-900 py-20 text-center text-white md:py-24">
      <div className="reine-container">
        {s(d.heading) && <h2 className="mb-10 text-4xl md:text-5xl">{s(d.heading)}</h2>}
        <div className="flex flex-wrap justify-center gap-12">
          {items(d.items).map((item, i) => (
            <div key={i}>
              <p className="font-heading text-5xl">{s(item.value)}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-white/70">
                {s(item.label)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
