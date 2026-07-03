import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, Img, arr, s } from "./_shared"

export function GalleryBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-22 md:py-28">
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-9 text-4xl md:text-5xl">{s(d.heading)}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {arr(d.images).slice(0, 5).map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl">
              <Img
                src={String(src)}
                alt={`Gallery ${i + 1}`}
                className="h-[420px] w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
