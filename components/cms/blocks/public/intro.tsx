import type { PublicBlockProps, AnyData } from "./types"
import { Btn, Eyebrow, Img, arr, s } from "./_shared"

export function IntroBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <section id="intro" className="bg-secondary py-22 md:py-28">
      <div className="reine-container grid gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow>{s(d.eyebrow)}</Eyebrow>
          <h2 className="mb-5 text-4xl md:text-5xl">{s(d.heading)}</h2>
          {s(d.body) && (
            <p className="mb-8 text-lg leading-8 text-muted-foreground">{s(d.body)}</p>
          )}
          <Btn label={d.buttonLabel} url={d.buttonUrl} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {arr(d.images)[0] && (
            <Img src={String(arr(d.images)[0])} className="h-[290px] w-full rounded-2xl object-cover md:h-[360px]" />
          )}
          {arr(d.images)[1] && (
            <Img src={String(arr(d.images)[1])} className="h-[290px] w-full rounded-2xl object-cover md:h-[360px]" />
          )}
          {arr(d.images)[2] && (
            <Img src={String(arr(d.images)[2])} className="col-span-2 h-[320px] w-full rounded-2xl object-cover md:h-[420px]" />
          )}
        </div>
      </div>
    </section>
  )
}
