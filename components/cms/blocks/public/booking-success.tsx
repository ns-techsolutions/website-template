import { BookingSuccessView as PublicBookingSuccessView } from "@/features/bookings/components/BookingSuccessView"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function BookingSuccessBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="font-sans">
      <PublicBookingSuccessView heading={s(d.heading)} message={s(d.message)} />
    </div>
  )
}
