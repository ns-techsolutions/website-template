import { cn } from "@/lib/utils"
import type { AdminBlockProps, AnyData } from "./types"
import { Heading, MockInput, Pill, s } from "./_shared"

export function BookingBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="px-6 py-10" style={{ backgroundColor: "#efefef" }}>
      <div className="mx-auto max-w-xl">
        {s(d.heading) && (
          <Heading className="mb-4 text-center text-2xl">{s(d.heading)}</Heading>
        )}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <MockInput />
          <MockInput />
          <MockInput />
          <MockInput />
          <MockInput />
          <MockInput />
        </div>
        <div className="mt-6 text-center">
          <Pill>{s(d.buttonLabel) || "Book Appointment"}</Pill>
        </div>
        <div className="mt-8 rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="mb-3 text-sm font-medium text-neutral-500">
            {s(d.calendarHeading) || "Select Availability"}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-[9px]",
                  i % 3 === 0 ? "bg-neutral-100 text-neutral-700" : "text-neutral-400"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
