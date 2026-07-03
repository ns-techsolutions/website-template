import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, items, s } from "./_shared"

export function LegalDocBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  const intro = s(d.intro).split(/\n\s*\n/).filter(Boolean)
  const sections = items(d.sections)
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="reine-container max-w-3xl">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        {s(d.title) && <h2 className="mb-3 text-4xl md:text-5xl">{s(d.title)}</h2>}
        {s(d.lastUpdated) && (
          <p className="mb-8 text-sm text-muted-foreground">Last updated: {s(d.lastUpdated)}</p>
        )}
        {intro.length > 0 && (
          <div className="mb-12 space-y-5 text-lg leading-relaxed text-muted-foreground">
            {intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        <div className="space-y-10">
          {sections.map((sec, i) => {
            const paragraphs = s(sec.body).split(/\n\s*\n/).filter(Boolean)
            return (
              <div key={i}>
                {s(sec.heading) && (
                  <h3 className="mb-3 text-2xl md:text-3xl">{`${i + 1}. ${s(sec.heading)}`}</h3>
                )}
                {paragraphs.length > 0 && (
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {paragraphs.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
