import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, LiveDataNote, SECONDARY, s } from "./_shared"

export function WorkingHoursBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-10" style={{ backgroundColor: SECONDARY }}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <LiveDataNote>Opening hours from Settings shown on the published page</LiveDataNote>
        </div>
        <div className="self-center">
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <Heading className="text-3xl">{s(d.heading)}</Heading>
          {s(d.body) && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">{s(d.body)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
