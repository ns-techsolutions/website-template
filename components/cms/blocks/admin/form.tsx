import type { AdminBlockProps, AnyData } from "./types"
import { Heading, MockInput, Pill, s } from "./_shared"

export function FormBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <Heading className="mb-4 text-center text-2xl">{s(d.heading)}</Heading>
      <div className="space-y-3">
        <MockInput />
        <MockInput />
        <div className="h-16 border-b border-neutral-300" />
        <div className="pt-2 text-center">
          <Pill variant="solid">{s(d.buttonLabel) || "Submit"}</Pill>
        </div>
      </div>
    </div>
  )
}
