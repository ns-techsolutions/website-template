import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, items, s } from "./_shared"

export function CardsBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-22 md:py-28">
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-4 text-4xl md:text-5xl">{s(d.heading)}</h2>
        {s(d.subheading) && (
          <p className="mb-10 max-w-3xl text-lg leading-8 text-muted-foreground">
            {s(d.subheading)}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items(d.items).map((item, i) => (
            <article
              key={i}
              className="rounded-2xl border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
            >
              <h3 className="mb-2 text-2xl">{s(item.title)}</h3>
              <p className="text-muted-foreground">{s(item.text)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
