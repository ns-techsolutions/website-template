import type { PublicBlockProps, AnyData } from "./types"
import { Eyebrow, s } from "./_shared"
import { Stars } from "@/components/common/Stars"

// Live published customer reviews. Data comes from the server-rendered
// `salon.reviews` (see `getSalonContent`), so this stays SEO-friendly and in
// sync with whatever the admin has approved — no client fetch.
export function CustomerReviewsBlock({ block, salon }: PublicBlockProps) {
  const d = block.data as AnyData
  const reviews = salon?.reviews ?? []
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <section className="bg-white py-22 md:py-28">
      <div className="reine-container">
        <Eyebrow>{s(d.eyebrow)}</Eyebrow>
        <h2 className="mb-8 text-4xl md:text-5xl">{s(d.heading)}</h2>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground">
            {s(d.emptyText) || "No reviews yet — be the first to leave one!"}
          </p>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-3">
              <Stars rating={Math.round(avg)} />
              <p className="text-lg font-medium">
                {avg.toFixed(1)}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-border bg-secondary p-7"
                >
                  <Stars rating={r.rating} />
                  {r.comment && (
                    <p className="mt-4 mb-5 leading-7 text-muted-foreground">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <p className="font-heading text-xl">{r.customer}</p>
                  <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                    {r.service}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
