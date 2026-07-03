import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, LiveDataNote, s } from "./_shared"

export function TeamBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-10 text-center" style={{ backgroundColor: "#f5f5f5" }}>
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="mb-6 text-3xl">{s(d.heading)}</Heading>
      <LiveDataNote>Selected staff shown on the published page</LiveDataNote>
    </div>
  )
}
