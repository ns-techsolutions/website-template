import { ArrowRight } from "lucide-react"

import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, Img, items, s } from "./_shared"

export function LocationsBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-22 md:py-28">
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-9 text-4xl md:text-5xl">{s(d.heading)}</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {items(d.items).map((loc, i) => (
            <article
              key={i}
              className="group overflow-hidden rounded-2xl border border-border bg-secondary transition-shadow duration-200 hover:shadow-lg"
            >
              <div className="overflow-hidden">
                <Img
                  src={s(loc.image)}
                  alt={s(loc.name)}
                  className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3 p-7">
                <h3 className="text-3xl">{s(loc.name)}</h3>
                <p className="text-muted-foreground">{s(loc.address)}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.13em]">
                  <span>{s(loc.established)}</span>
                  <a href="#" className="inline-flex items-center gap-2 text-primary">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="/book-appointment" className="inline-flex items-center gap-2">
                    Book Now <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
