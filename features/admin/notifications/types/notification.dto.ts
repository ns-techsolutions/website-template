// Derived, read-only admin notifications. These are not persisted — each one is
// computed from an existing domain event (a pending leave request, a review
// awaiting moderation, a booking scheduled for today). Read/dismiss state is
// tracked client-side, keyed by the stable `id`.

export type NotificationType = "leave" | "review" | "booking";

export interface NotificationDto {
  /** Stable across refetches, e.g. `leave:<leaveId>` — drives client read state. */
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Admin deep link to the relevant page. */
  href: string;
  /** ISO timestamp the underlying event occurred; list is sorted newest-first. */
  createdAt: string;
}
