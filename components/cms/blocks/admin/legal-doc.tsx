import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, items, s } from "./_shared"

export function LegalDocBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  const sections = items(d.sections)
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="text-3xl">{s(d.title)}</Heading>
      {s(d.lastUpdated) && (
        <p className="mt-1 text-xs text-neutral-400">Last updated: {s(d.lastUpdated)}</p>
      )}
      {s(d.intro) && (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{s(d.intro)}</p>
      )}
      {sections.length > 0 && (
        <div className="mt-6 space-y-5">
          {sections.map((sec, i) => (
            <div key={i}>
              <p className="font-serif text-lg text-neutral-900">
                {`${i + 1}. ${s(sec.heading)}`}
              </p>
              {s(sec.body) && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{s(sec.body)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
