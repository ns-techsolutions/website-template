/** Client -> server payload for creating a booking. */
export interface CreateBookingRequest {
  customerName: string;
  email: string;
  phone?: string;
  /** A free-text service label, or (preferred) a catalog id. One is required. */
  service?: string;
  serviceId?: string;
  staff?: string;
  staffId?: string;
  /** ISO or "yyyy-MM-dd" date string. */
  date: string;
  /** "HH:mm". */
  time: string;
  /** Email-verification code; required for guest bookings, omitted otherwise. */
  code?: string;
}

/** Client -> server payload for updating/rescheduling a booking. */
export interface UpdateBookingRequest {
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  date?: string;
  time?: string;
}
