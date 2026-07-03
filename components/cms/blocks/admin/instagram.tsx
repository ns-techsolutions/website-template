import type { AdminBlockProps, AnyData } from "./types"
import { Img, arr, s } from "./_shared"

export function InstagramBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="bg-white px-6 py-8">
      <p className="mb-4 font-serif text-xl text-neutral-900">
        {s(d.heading)}{" "}
        <span className="text-neutral-500">{s(d.handle)}</span>
      </p>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
        {arr(d.images).map((src, i) => (
          <Img key={i} src={String(src)} className="h-20 w-full rounded-lg object-cover" />
        ))}
        {arr(d.images).length === 0 && (
          <p className="col-span-full text-center text-sm text-neutral-400">No images yet</p>
        )}
      </div>
    </div>
  )
}
