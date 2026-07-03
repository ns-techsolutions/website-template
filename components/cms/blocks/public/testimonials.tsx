import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, items, s } from "./_shared"

export function TestimonialsBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-22 md:py-28">
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-8 text-4xl md:text-5xl">{s(d.heading)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items(d.items).map((item, i) => (
            <article key={i} className="rounded-2xl border border-border bg-secondary p-7">
              <p className="mb-5 leading-7 text-muted-foreground">{s(item.quote)}</p>
              <p className="font-heading text-2xl">{s(item.author)}</p>
              <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                {s(item.meta)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
