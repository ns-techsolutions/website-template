import type { PublicBlockProps, AnyData } from "./types"
import { Btn, Eyebrow, s } from "./_shared"

export function OfferBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-secondary py-22 md:py-28">
      <div className="reine-container text-center">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="text-5xl md:text-6xl">{s(d.heading)}</h2>
        {s(d.subheading) && (
          <h3 className="mt-2 text-2xl text-primary md:text-3xl">{s(d.subheading)}</h3>
        )}
        <Btn label={d.buttonLabel} url={d.buttonUrl} className="mt-8" />
      </div>
    </section>
  )
}
