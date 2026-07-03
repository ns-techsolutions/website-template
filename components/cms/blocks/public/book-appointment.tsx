import { AppointmentForm as PublicAppointmentForm } from "@/features/book-appointment/components/AppointmentForm"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function BookAppointmentBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-[#efefef] text-[#2f2f2f]">
      <div
        className="relative min-h-[305px] overflow-hidden"
        style={
          s(d.heroImage)
            ? {
                backgroundImage: `url('${s(d.heroImage)}')`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-[#2f1e16]/54 backdrop-blur-[1px]" />
        <div className="reine-container relative z-10 pt-32 pb-12 text-center md:pt-40 md:pb-14">
          <p className="font-heading text-[3.2rem] leading-[1.05] tracking-[0.01em] text-white md:text-[3.68rem]">
            {s(d.heroTitle) || "Book an Appointment"}
          </p>
          {s(d.heroSubtitle) && (
            <p className="mt-3 text-[1.12rem] font-medium text-white/95">{s(d.heroSubtitle)}</p>
          )}
        </div>
      </div>
      <PublicAppointmentForm />
    </section>
  )
}
