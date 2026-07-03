import { AccountView as PublicAccountView } from "@/features/account/components/AccountView"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function BookingsBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="font-sans min-h-screen flex flex-col">
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
          {s(d.heroEyebrow) && (
            <p className="mb-4 text-sm font-bold tracking-[0.2em] uppercase text-white/80">
              {s(d.heroEyebrow)}
            </p>
          )}
          <p className="font-heading text-[3.2rem] leading-[1.05] tracking-[0.01em] text-white md:text-[3.68rem]">
            {s(d.heroTitle) || "My Account"}
          </p>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <PublicAccountView />
      </div>
    </section>
  )
}
