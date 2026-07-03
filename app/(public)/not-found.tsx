import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/common/PublicNavbar";

// The navbar is rendered per-page (see PublicNavbar), so this unmatched-route
// boundary renders its own. The dark full-height backdrop pairs with the
// transparent overlay navbar and keeps the 404 on-brand.
export default function PublicNotFound() {
  return (
    <>
      <PublicNavbar overlay />
      <main className="bg-[#2f1e16] text-white">
        <section className="reine-container flex min-h-[70vh] flex-col items-center justify-center pt-32 pb-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            404
          </p>
          <h1 className="mb-3 font-heading text-[2.6rem] leading-[1.05] md:text-[3.2rem]">
            Page not found
          </h1>
          <p className="mb-8 max-w-md text-white/80">
            The page you’re looking for doesn’t exist or may have moved.
          </p>
          <Button asChild variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        </section>
      </main>
    </>
  );
}
