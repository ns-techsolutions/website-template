import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Pill, SECONDARY, s } from "./_shared"

export function OfferBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-12 text-center" style={{ backgroundColor: SECONDARY }}>
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <h2 className="font-serif text-4xl text-neutral-900">{s(d.heading)}</h2>
      {s(d.subheading) && (
        <p className="mt-1 font-serif text-xl text-neutral-700">{s(d.subheading)}</p>
      )}
      {s(d.buttonLabel) && (
        <div className="pt-5">
          <Pill>{s(d.buttonLabel)}</Pill>
        </div>
      )}
    </div>
  )
}
