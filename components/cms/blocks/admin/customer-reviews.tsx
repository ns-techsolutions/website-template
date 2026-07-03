import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, LiveDataNote, s } from "./_shared"

export function CustomerReviewsBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="mb-5 text-3xl">{s(d.heading)}</Heading>
      <LiveDataNote>
        Approved customer reviews appear here on the published page
      </LiveDataNote>
    </div>
  )
}
