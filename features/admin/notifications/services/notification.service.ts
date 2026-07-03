import { leaveService } from "@/features/admin/leave/services/leave.service";
import { reviewService } from "@/features/admin/reviews/services/review.service";
import { dashboardService } from "@/features/admin/dashboard/services/dashboard.service";

import type { NotificationDto } from "../types/notification.dto";

const MAX_ITEMS = 30;

/**
 * Builds the admin notification feed by deriving it from existing domain data —
 * nothing is persisted. Sources:
 *   - leave requests awaiting approval
 *   - reviews awaiting moderation (unpublished)
 *   - appointments scheduled for today
 * Items are sorted newest-first and capped at {@link MAX_ITEMS}.
 */
export const notificationService = {
  async list(workspaceId: string): Promise<NotificationDto[]> {
    const [pendingLeave, reviews, dashboard] = await Promise.all([
      leaveService.list(workspaceId, "pending"),
      reviewService.list(workspaceId),
      dashboardService.get(),
    ]);

    const items: NotificationDto[] = [];

    for (const l of pendingLeave) {
      items.push({
        id: `leave:${l.id}`,
        type: "leave",
        title: "Leave request pending",
        message: `${l.staff} · ${l.days} day${l.days === 1 ? "" : "s"} ${l.type} leave`,
        href: "/admin/leave",
        createdAt: dateToIso(l.appliedOn),
      });
    }

    for (const r of reviews) {
      if (r.published) continue; // only unmoderated reviews are actionable
      items.push({
        id: `review:${r.id}`,
        type: "review",
        title: "Review awaiting approval",
        message: `${r.rating}★ from ${r.customer}`,
        href: "/admin/reviews",
        createdAt: dateToIso(r.date),
      });
    }

    for (const a of dashboard.today) {
      items.push({
        id: `booking:${a.id}`,
        type: "booking",
        title: "Appointment today",
        message: `${a.time} · ${a.customer} · ${a.service}`,
        href: "/admin/appointments",
        createdAt: dateTimeToIso(a.date, a.time),
      });
    }

    return items
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, MAX_ITEMS);
  },
};

/** Normalises a date-only ("yyyy-MM-dd") or ISO value to a sortable ISO string. */
function dateToIso(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

/** Combines an appointment date + "HH:mm" time into a sortable ISO string. */
function dateTimeToIso(date: string, time: string): string {
  const day = date.slice(0, 10);
  const d = new Date(`${day}T${time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? dateToIso(date) : d.toISOString();
}
