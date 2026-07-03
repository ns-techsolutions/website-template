import { BookingCancelledView as PublicBookingCancelledView } from "@/features/bookings/components/BookingCancelledView"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function BookingCancelledBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <div className="font-sans">
      <PublicBookingCancelledView heading={s(d.heading)} message={s(d.message)} />
    </div>
  )
}
