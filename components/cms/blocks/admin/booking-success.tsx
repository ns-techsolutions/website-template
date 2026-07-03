import { CheckCircle2Icon } from "lucide-react"

import type { AdminBlockProps, AnyData } from "./types"
import { Pill, s } from "./_shared"

export function BookingSuccessBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-white px-6 py-10">
      <div className="mx-auto max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2Icon className="size-12 text-[#1E7E34]" />
        </div>
        <h2 className="mb-2 text-xl font-medium">{s(d.heading)}</h2>
        <p className="text-sm text-neutral-500">{s(d.message)}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Pill>View my appointments</Pill>
          <Pill variant="light">Back to home</Pill>
        </div>
      </div>
    </div>
  )
}
