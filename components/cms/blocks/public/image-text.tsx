import { Check } from "lucide-react"

import type { PublicBlockProps, AnyData } from "./types"
import { Btn, Eyebrow, Img, items, s } from "./_shared"

export function ImageTextBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-secondary py-22 md:py-28">
      <div className="reine-container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <h2 className="mb-5 text-4xl md:text-5xl">{s(d.heading)}</h2>
          <ul className="space-y-3 text-muted-foreground">
            {items(d.bullets).map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                {s(b.text)}
              </li>
            ))}
          </ul>
          <Btn label={d.buttonLabel} url={d.buttonUrl} className="mt-8" />
        </div>
        <Img src={s(d.image)} className="h-[520px] w-full rounded-3xl object-cover" />
      </div>
    </section>
  )
}
