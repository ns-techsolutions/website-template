/**
 * Client-facing booking shape. Intentionally matches the old `PublicAppointment`
 * (incl. the hyphenated "no-show" status) so the existing UI needs minimal changes.
 */
export type BookingStatusView =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface BookingView {
  id: string;
  reference: string;
  email: string;
  customerName: string;
  phone?: string;
  service: string;
  staff?: string;
  /** ISO date string. */
  date: string;
  /** "HH:mm". */
  time: string;
  status: BookingStatusView;
  createdAt: string;
}
