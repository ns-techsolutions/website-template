import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, Img, Pill, SECONDARY, arr, s } from "./_shared"

export function IntroBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  const imgs = arr(d.images).map(String)
  return (
    <div className="px-6 py-10" style={{ backgroundColor: SECONDARY }}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <Heading className="text-3xl">{s(d.heading)}</Heading>
          {s(d.body) && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">{s(d.body)}</p>
          )}
          {s(d.buttonLabel) && (
            <div className="pt-4">
              <Pill>{s(d.buttonLabel)}</Pill>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {imgs[0] && <Img src={imgs[0]} className="h-28 w-full rounded-xl object-cover" />}
          {imgs[1] && <Img src={imgs[1]} className="h-28 w-full rounded-xl object-cover" />}
          {imgs[2] && (
            <Img src={imgs[2]} className="col-span-2 h-32 w-full rounded-xl object-cover" />
          )}
        </div>
      </div>
    </div>
  )
}
