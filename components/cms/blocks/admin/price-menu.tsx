import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, LiveDataNote, Pill, s } from "./_shared"

export function PriceMenuBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="mb-5 border-b border-neutral-200 pb-3 text-2xl">
        {s(d.heading)}
      </Heading>
      <LiveDataNote>Services from the Services page shown on the published page</LiveDataNote>
      {s(d.buttonLabel) && (
        <div className="pt-6">
          <Pill>{s(d.buttonLabel)}</Pill>
        </div>
      )}
    </div>
  )
}
