import { Clock, MapPin, Phone } from "lucide-react"

import { ContactSplitForm } from "@/features/contact/components/ContactSplitForm"
import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, hoursRow, s } from "./_shared"

export function ContactSplitBlock({ block, salon }: PublicBlockProps) {
  const d = block.data as AnyData
  const hoursText = (salon?.openingHours ?? [])
    .map((h) => `${hoursRow(h).label}: ${hoursRow(h).value}`)
    .join("\n")
  const info = [
    { icon: MapPin, label: "Location", text: salon?.address ?? "" },
    { icon: Phone, label: "Phone numbers", text: salon?.contactPhone ?? "" },
    { icon: Clock, label: "Working hours", text: hoursText },
  ]
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="reine-container grid max-w-6xl gap-16 md:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <h2 className="mb-8 text-4xl">{s(d.heading)}</h2>
          <div className="space-y-8">
            {info.map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-foreground">
                    {label}
                  </h3>
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border p-8">
          {s(d.formHeading) && (
            <h3 className="mb-6 text-2xl">{s(d.formHeading)}</h3>
          )}
          <ContactSplitForm buttonLabel={s(d.buttonLabel) || "Send Message"} />
        </div>
      </div>
    </section>
  )
}
