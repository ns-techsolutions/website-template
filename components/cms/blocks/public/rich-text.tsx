import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function RichTextBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="reine-container max-w-3xl text-center">
        {s(d.heading) && <h2 className="mb-5 text-4xl md:text-5xl">{s(d.heading)}</h2>}
        {s(d.body) && (
          <p className="text-lg leading-8 text-muted-foreground">{s(d.body)}</p>
        )}
      </div>
    </section>
  )
}
