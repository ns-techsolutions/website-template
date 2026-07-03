import { ClockIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import type { AdminBlockProps, AnyData } from "./types"
import { Heading, Eyebrow, MockInput, Pill, s } from "./_shared"

export function ContactSplitBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  const infoGroups = [
    { icon: MapPinIcon, label: "Location" },
    { icon: PhoneIcon, label: "Phone numbers" },
    { icon: ClockIcon, label: "Working hours" },
  ]
  return (
    <div className="bg-white px-6 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <Heading className="mb-5 text-2xl">{s(d.heading)}</Heading>
          <div className="space-y-4">
            {infoGroups.map(({ icon: Icon, label }) => (
              <div key={label} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200">
                  <Icon className="size-4 text-neutral-700" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-900">
                    {label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    From Salon settings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="mb-4 font-serif text-lg text-neutral-900">{s(d.formHeading)}</p>
          <div className="space-y-3">
            <MockInput />
            <MockInput />
            <MockInput />
            <div className="h-14 border-b border-neutral-300" />
            <div className="pt-2">
              <Pill variant="solid">{s(d.buttonLabel) || "Send Message"}</Pill>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
