import type { PublicBlockProps, AnyData } from "./types"
import { Img, arr, s } from "./_shared"

export function InstagramBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section className="bg-white py-16">
      <div className="reine-container">
        <h2 className="mb-6 text-3xl md:text-4xl">
          {s(d.heading) || "Follow:"}{" "}
          <a href="#" className="text-primary">
            {s(d.handle)}
          </a>
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {arr(d.images).map((src, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <Img
                src={String(src)}
                alt={`Instagram ${i + 1}`}
                className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
