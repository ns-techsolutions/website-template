import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, Img, items, s } from "./_shared"

export function StoryBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  const paragraphs = s(d.body).split(/\n\s*\n/).filter(Boolean)
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="reine-container grid items-center gap-12 md:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <h2 className="mb-6 text-4xl leading-tight md:text-5xl">{s(d.heading)}</h2>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {items(d.stats).length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-10">
              {items(d.stats).map((st, i) => (
                <div key={i}>
                  <p className="mb-2 font-heading text-4xl text-primary">{s(st.value)}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                    {s(st.label)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <Img src={s(d.image)} alt="" className="h-[600px] w-full rounded-3xl object-cover" />
      </div>
    </section>
  )
}
