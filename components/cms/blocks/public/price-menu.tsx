import { formatMoney } from "@/lib/admin/format"
import type { PublicBlockProps, AnyData } from "./types"
import { Btn, Eyebrow, s } from "./_shared"

export function PriceMenuBlock({ block, salon }: PublicBlockProps) {
  const d = block.data as AnyData
  const services = salon?.services ?? []
  return (
    <section className="bg-white py-22 md:py-28">
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-8 text-4xl md:text-5xl">{s(d.heading)}</h2>
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.id}>
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <p className="text-lg text-foreground">{service.name}</p>
                <span className="flex-1 border-b border-dotted border-neutral-300" />
                <p className="font-medium text-primary">
                  {formatMoney(service.price, salon?.currency ?? "gbp")}
                </p>
              </div>
              <p className="text-left text-muted-foreground">{service.duration} min</p>
            </div>
          ))}
        </div>
        <Btn label={d.buttonLabel} url={d.buttonUrl} className="mt-8" />
      </div>
    </section>
  )
}
