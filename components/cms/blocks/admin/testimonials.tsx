import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, SECONDARY, items, s } from "./_shared"

export function TestimonialsBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="mb-5 text-3xl">{s(d.heading)}</Heading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items(d.items).map((item, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 p-5" style={{ backgroundColor: SECONDARY }}>
            <p className="text-sm leading-relaxed text-neutral-600">{s(item.quote)}</p>
            <p className="mt-4 font-serif text-lg text-neutral-900">{s(item.author)}</p>
            <p className="text-[10px] tracking-[0.16em] uppercase text-neutral-500">
              {s(item.meta)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
