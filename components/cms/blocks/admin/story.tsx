import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, Img, items, s } from "./_shared"

export function StoryBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  const paragraphs = s(d.body).split(/\n\s*\n/).filter(Boolean)
  return (
    <div className="bg-white px-6 py-10">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <Heading className="text-3xl leading-tight">{s(d.heading)}</Heading>
          <div className="mt-4 space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-neutral-600">
                {p}
              </p>
            ))}
          </div>
          {items(d.stats).length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-6 border-t border-neutral-200 pt-6">
              {items(d.stats).map((st, i) => (
                <div key={i}>
                  <p className="font-serif text-3xl text-neutral-900">{s(st.value)}</p>
                  <p className="mt-1 text-[10px] font-bold tracking-wider uppercase text-neutral-900">
                    {s(st.label)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {s(d.image) && (
          <Img src={s(d.image)} className="h-80 w-full rounded-3xl object-cover" />
        )}
      </div>
    </div>
  )
}
