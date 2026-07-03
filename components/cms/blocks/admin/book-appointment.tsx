import type { AdminBlockProps, AnyData } from "./types"
import { Img, LabeledInput, Pill, s } from "./_shared"

export function BookAppointmentBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div>
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden bg-neutral-800 px-6 py-10 text-center text-white min-h-32"
      >
        {s(d.heroImage) && (
          <Img src={s(d.heroImage)} className="absolute inset-0 size-full object-cover" />
        )}
        <div className="absolute inset-0 bg-[#2f1e16]/54" />
        <div className="relative z-10 space-y-2">
          <h2 className="font-serif text-2xl uppercase">{s(d.heroTitle) || "Book an Appointment"}</h2>
          {s(d.heroSubtitle) && (
            <p className="text-xs text-white/90">{s(d.heroSubtitle)}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-8" style={{ backgroundColor: "#efefef" }}>
        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <LabeledInput label="First Name" placeholder="First Name" />
            <LabeledInput label="Last Name" placeholder="Last Name" />
            <LabeledInput label="Email" placeholder="Email Address" />
            <LabeledInput label="Phone" placeholder="Phone Number" />
            <LabeledInput label="Service" placeholder="---Please choose a service---" />
            <LabeledInput label="Staff" placeholder="---Any available stylist---" />
          </div>
          <div className="mt-4">
            <LabeledInput label="Date" placeholder="mm/dd/yyyy" />
          </div>
          <div className="mt-5 text-center">
            <Pill>Book Appointment</Pill>
          </div>
        </div>
      </div>
    </div>
  )
}
