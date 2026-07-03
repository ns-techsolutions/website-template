"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BookingSuccessView({ heading, message }: { heading?: string; message?: string }) {
  return (
    <Suspense>
      <BookingSuccessContent heading={heading} message={message} />
    </Suspense>
  );
}

function BookingSuccessContent({ heading, message }: { heading?: string; message?: string }) {
  const params = useSearchParams();
  const ref = params.get("ref");

  return (
    <section className="bg-background text-foreground">
      {/* Dark hero band: the site navbar is absolutely positioned with white text,
          so a no-hero light page would render it invisibly. The dark band (and the
          pt-32 top padding it shares with other hero pages) keeps the navbar legible. */}
      <div className="bg-[#2f1e16]">
        <div className="reine-container pt-32 pb-14 text-center md:pt-40 md:pb-16">
          <div className="mb-5 flex justify-center">
            <CheckCircle2Icon className="size-14 text-[#7FD99B]" />
          </div>
          <h1 className="font-heading text-[2.6rem] leading-[1.05] text-white md:text-[3.2rem]">
            {heading || "Payment confirmed!"}
          </h1>
        </div>
      </div>

      <div className="reine-container py-14 text-center md:py-16">
        <p className="mx-auto max-w-md text-[#595959]">
          {message || "Your deposit has been received and your appointment is now confirmed."}
        </p>
        {ref && (
          <p className="mt-2 text-sm text-[#595959]">
            Booking reference:{" "}
            <span className="font-semibold text-foreground">{ref}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/account">View my appointments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
