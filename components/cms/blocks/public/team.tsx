import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, Img, items, s } from "./_shared"

export function TeamBlock({ block, salon }: PublicBlockProps) {
  const d = block.data as AnyData
  const allStaff = salon?.staff ?? []
  const byId = new Map(allStaff.map((m) => [m.id, m]))
  const picked = items(d.members)
    .map((m) => byId.get(s(m.staffId)))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
  const members = picked.length ? picked : allStaff
  return (
    <section className="bg-neutral-100 py-20 md:py-28">
      <div className="reine-container mx-auto max-w-4xl text-center">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-12 text-4xl md:text-5xl">{s(d.heading)}</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="group">
              <div className="mb-4 h-80 overflow-hidden rounded-2xl">
                {m.image ? (
                  <Img
                    src={m.image}
                    alt={m.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-200" />
                )}
              </div>
              <h3 className="mb-1 text-xl">{m.name}</h3>
              <p className="text-sm uppercase tracking-widest text-muted-foreground">
                {m.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
