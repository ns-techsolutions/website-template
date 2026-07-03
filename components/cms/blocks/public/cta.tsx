import type { PublicBlockProps, AnyData } from "./types"
import { Btn, Eyebrow, s } from "./_shared"

export function CtaBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section
      className="py-22 text-center md:py-28"
      style={{ backgroundColor: s(d.background) || "var(--accent)" }}
    >
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-5 text-4xl md:text-5xl">{s(d.heading)}</h2>
        {s(d.body) && (
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-8 text-muted-foreground">
            {s(d.body)}
          </p>
        )}
        <Btn label={d.buttonLabel} url={d.buttonUrl} />
      </div>
    </section>
  )
}
