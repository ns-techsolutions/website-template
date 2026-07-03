import type { PublicBlockProps, AnyData } from "./types"
import { Btn, s } from "./_shared"

export function BookingBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="py-20 text-center md:py-24" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="reine-container max-w-2xl">
        {s(d.heading) && <h2 className="mb-6 text-4xl md:text-5xl">{s(d.heading)}</h2>}
        <p className="mb-8 text-lg text-muted-foreground">
          Choose your service, stylist and time — we&apos;ll take care of the rest.
        </p>
        <Btn label={s(d.buttonLabel) || "Book Appointment"} url="/book-appointment" />
      </div>
    </section>
  )
}
