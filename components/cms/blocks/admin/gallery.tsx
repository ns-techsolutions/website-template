import type { AdminBlockProps, AnyData } from "./types"
import { Eyebrow, Heading, Img, arr, s } from "./_shared"

export function GalleryBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-10">
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="mb-5 text-3xl">{s(d.heading)}</Heading>
      <div className="grid grid-cols-5 gap-2">
        {arr(d.images).map((src, i) => (
          <Img key={i} src={String(src)} className="h-36 w-full rounded-xl object-cover" />
        ))}
        {arr(d.images).length === 0 && (
          <p className="col-span-full text-center text-sm text-neutral-400">No images yet</p>
        )}
      </div>
    </div>
  )
}
