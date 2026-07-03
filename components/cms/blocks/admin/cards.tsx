import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, items, s } from "./_shared"

export function CardsBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="text-3xl">{s(d.heading)}</Heading>
      {s(d.subheading) && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
          {s(d.subheading)}
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items(d.items).map((item, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 p-4">
            <div className="mb-2 size-7 rounded-full bg-neutral-900/10" />
            <p className="font-serif text-lg text-neutral-900">{s(item.title)}</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">{s(item.text)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
