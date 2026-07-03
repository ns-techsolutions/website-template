import type { AdminBlockProps, AnyData } from "./types"
import { Heading, s } from "./_shared"

export function RichTextBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-center">
      <Heading className="text-2xl">{s(d.heading)}</Heading>
      {s(d.body) && (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{s(d.body)}</p>
      )}
    </div>
  )
}
