import { cn } from "@/lib/utils"
import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, hoursRow, s } from "./_shared"

export function WorkingHoursBlock({ block, salon }: PublicBlockProps) {
  const d = block.data as AnyData
  const rows = (salon?.openingHours ?? []).map(hoursRow)
  return (
    <section className="bg-secondary py-22 md:py-28">
      <div className="reine-container grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl bg-white p-8 shadow-sm md:p-10">
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn(
                "flex justify-between py-2",
                i < rows.length - 1 && "border-b border-border",
              )}
            >
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
        <div className="self-center">
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <h2 className="mb-5 text-4xl md:text-5xl">{s(d.heading)}</h2>
          {s(d.body) && (
            <p className="text-lg leading-8 text-muted-foreground">{s(d.body)}</p>
          )}
        </div>
      </div>
    </section>
  )
}
