import { ArrowRightIcon } from "lucide-react"

import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, Img, SECONDARY, items, s } from "./_shared"

export function LocationsBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="mb-5 text-3xl">{s(d.heading)}</Heading>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items(d.items).map((loc, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-neutral-200"
            style={{ backgroundColor: SECONDARY }}
          >
            {s(loc.image) && (
              <Img src={s(loc.image)} className="h-36 w-full object-cover" />
            )}
            <div className="space-y-1.5 p-4">
              <p className="font-serif text-xl text-neutral-900">{s(loc.name)}</p>
              <p className="text-xs text-neutral-500">{s(loc.address)}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[9px] tracking-[0.13em] uppercase text-neutral-700">
                <span>{s(loc.established)}</span>
                <span className="inline-flex items-center gap-1">
                  Learn More <ArrowRightIcon className="size-2.5" />
                </span>
                <span className="inline-flex items-center gap-1">
                  Book Now <ArrowRightIcon className="size-2.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
