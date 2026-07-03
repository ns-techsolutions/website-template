import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, Pill, SECONDARY, s } from "./_shared"

export function CtaBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-12 text-center" style={{ backgroundColor: s(d.background) || SECONDARY }}>
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="text-3xl">{s(d.heading)}</Heading>
      {s(d.body) && (
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-neutral-600">
          {s(d.body)}
        </p>
      )}
      {s(d.buttonLabel) && (
        <div className="pt-5">
          <Pill>{s(d.buttonLabel)}</Pill>
        </div>
      )}
    </div>
  )
}
