import { CheckIcon } from "lucide-react"

import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, Img, Pill, SECONDARY, items, s } from "./_shared"

export function ImageTextBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-10" style={{ backgroundColor: SECONDARY }}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <Heading className="text-3xl">{s(d.heading)}</Heading>
          <ul className="mt-4 space-y-2">
            {items(d.bullets).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-neutral-900" />
                {s(b.text)}
              </li>
            ))}
          </ul>
          {s(d.buttonLabel) && (
            <div className="pt-5">
              <Pill>{s(d.buttonLabel)}</Pill>
            </div>
          )}
        </div>
        {s(d.image) && (
          <Img src={s(d.image)} className="h-64 w-full rounded-3xl object-cover" />
        )}
      </div>
    </div>
  )
}
