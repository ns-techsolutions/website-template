import { NewsletterForm } from "@/features/newsletter/components/NewsletterForm"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function NewsletterBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="py-18 md:py-20" style={{ backgroundColor: "var(--accent)" }}>
      <div className="reine-container flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-4xl">{s(d.heading)}</h2>
          {s(d.subheading) && <p className="mt-2 text-muted-foreground">{s(d.subheading)}</p>}
        </div>
        <NewsletterForm
          placeholder={s(d.placeholder) || "Enter your email here"}
          buttonLabel={s(d.buttonLabel) || "Subscribe"}
        />
      </div>
    </section>
  )
}
