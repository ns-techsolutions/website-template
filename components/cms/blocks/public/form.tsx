import type { PublicBlockProps, AnyData } from "./types"
import { Btn, s } from "./_shared"

export function FormBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="reine-container max-w-xl">
        {s(d.heading) && (
          <h2 className="mb-8 text-center text-4xl md:text-5xl">{s(d.heading)}</h2>
        )}
        <div className="space-y-4">
          <div className="h-12 rounded-full border border-border" />
          <div className="h-12 rounded-full border border-border" />
          <div className="h-32 rounded-2xl border border-border" />
          <div className="text-center">
            <Btn label={s(d.buttonLabel) || "Submit"} url="#" />
          </div>
        </div>
      </div>
    </section>
  )
}
