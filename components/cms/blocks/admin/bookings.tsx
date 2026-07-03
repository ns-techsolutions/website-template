import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Img, s } from "./_shared"

export function BookingsBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div>
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden bg-neutral-800 px-6 py-10 text-center text-white min-h-32"
      >
        {s(d.heroImage) && (
          <Img src={s(d.heroImage)} className="absolute inset-0 size-full object-cover" />
        )}
        <div className="absolute inset-0 bg-[#1f0d0a]/50" />
        <div className="relative z-10 space-y-2">
          <Eyebrow light>{s(d.heroEyebrow)}</Eyebrow>
          <h2 className="font-serif text-2xl uppercase">{s(d.heroTitle) || "My Account"}</h2>
        </div>
      </div>
      <div className="bg-white px-6 py-8">
        <div className="mx-auto max-w-md">
          <div className="flex flex-col items-center text-center mb-5">
            <span className="flex size-12 items-center justify-center rounded-full bg-neutral-900 font-serif text-base text-white">
              JD
            </span>
            <p className="mt-2 font-serif text-base text-neutral-900">Jane Doe</p>
            <p className="text-xs text-neutral-500">jane@example.com</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-sm text-neutral-900">Hair Styling</p>
                  <p className="mt-1 text-[10px] text-neutral-500">Mon, Jan 15 · 10:00 AM</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700">Pending</span>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-sm text-neutral-900">Facial Treatment</p>
                  <p className="mt-1 text-[10px] text-neutral-500">Wed, Jan 17 · 2:00 PM</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-700">Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
