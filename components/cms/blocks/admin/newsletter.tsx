import type { AdminBlockProps, AnyData } from "./types"
import { Heading, Pill, s } from "./_shared"

export function NewsletterBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-8" style={{ backgroundColor: "#f1efec" }}>
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <Heading className="text-2xl">{s(d.heading)}</Heading>
          {s(d.subheading) && (
            <p className="mt-1 text-sm text-neutral-600">{s(d.subheading)}</p>
          )}
        </div>
        <div className="flex w-full max-w-sm items-center gap-2">
          <div className="flex h-9 flex-1 items-center rounded-full bg-white px-4 text-xs text-neutral-400">
            {s(d.placeholder)}
          </div>
          <Pill variant="solid" className="px-5 py-2.5">
            {s(d.buttonLabel) || "Subscribe"}
          </Pill>
        </div>
      </div>
    </div>
  )
}
