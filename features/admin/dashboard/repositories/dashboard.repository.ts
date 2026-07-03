import { Prisma, type BookingStatus } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import { toAppointmentDto } from "@/features/admin/appointments/repositories/appointment.repository";
import type {
  DashboardData,
  DashboardStats,
  RevenuePoint,
  ServiceMixSlice,
  WeekdayCount,
} from "../types/dashboard.dto";

const DAY_MS = 1000 * 60 * 60 * 24;

// Statuses that count toward earned revenue & activity — cancelled and no-shows
// are excluded as they represent no completed work.
const EARNED: BookingStatus[] = ["pending", "confirmed", "completed"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Brand-tinted palette reused for the service-mix donut.
const MIX_COLORS = ["#2d3b64", "#4a5da0", "#7c8bc4", "#a6b1d8", "#cdd3e8", "#e3e7f2"];

// Matches the AppointmentRow payload shape `toAppointmentDto` expects.
const withRefs = {
  include: {
    serviceRef: { select: { price: true, duration: true } },
    payments: { select: { status: true }, orderBy: { createdAt: "desc" as const }, take: 1 },
  },
} satisfies Prisma.BookingDefaultArgs;

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const dashboardRepository = {
  async get(): Promise<DashboardData> {
    const db = await getTenantDb();

    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();

    const thisMonthStart = new Date(Date.UTC(y, m, 1));
    const lastMonthStart = new Date(Date.UTC(y, m - 1, 1));
    const nextMonthStart = new Date(Date.UTC(y, m + 1, 1));
    const sixMonthsStart = new Date(Date.UTC(y, m - 5, 1));

    // Monday-anchored week containing today (UTC).
    const sinceMon = (now.getUTCDay() + 6) % 7;
    const weekStart = new Date(Date.UTC(y, m, now.getUTCDate() - sinceMon));
    const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);

    const todayStart = new Date(Date.UTC(y, m, now.getUTCDate()));
    const todayEnd = new Date(todayStart.getTime() + DAY_MS);

    const earnedIn = (gte: Date, lt: Date) => ({
      status: { in: EARNED },
      date: { gte, lt },
    });

    const [
      thisMonthAgg,
      lastMonthAgg,
      newCustThis,
      newCustLast,
      sixMonthRows,
      weekRows,
      mixGroups,
      todayRows,
      recentRows,
      ratingAll,
      ratingThis,
      ratingLast,
    ] = await Promise.all([
      db.booking.aggregate({
        _sum: { price: true },
        _count: { _all: true },
        where: earnedIn(thisMonthStart, nextMonthStart),
      }),
      db.booking.aggregate({
        _sum: { price: true },
        _count: { _all: true },
        where: earnedIn(lastMonthStart, thisMonthStart),
      }),
      db.user.count({
        where: { role: "customer", createdAt: { gte: thisMonthStart, lt: nextMonthStart } },
      }),
      db.user.count({
        where: { role: "customer", createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
      }),
      db.booking.findMany({
        where: earnedIn(sixMonthsStart, nextMonthStart),
        select: { date: true, price: true },
      }),
      db.booking.findMany({
        where: earnedIn(weekStart, weekEnd),
        select: { date: true },
      }),
      db.booking.groupBy({
        by: ["serviceId"],
        where: { status: { in: EARNED } },
        _count: { _all: true },
      }),
      db.booking.findMany({
        where: { date: { gte: todayStart, lt: todayEnd } },
        orderBy: { time: "asc" },
        ...withRefs,
      }),
      db.booking.findMany({ orderBy: { createdAt: "desc" }, take: 6, ...withRefs }),
      db.review.aggregate({ _avg: { rating: true } }),
      db.review.aggregate({
        _avg: { rating: true },
        where: { createdAt: { gte: thisMonthStart, lt: nextMonthStart } },
      }),
      db.review.aggregate({
        _avg: { rating: true },
        where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
      }),
    ]);

    // --- Revenue series: 6 buckets, oldest → current month ---
    const buckets = new Map<number, RevenuePoint>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(Date.UTC(y, m - 5 + i, 1));
      buckets.set(d.getUTCFullYear() * 12 + d.getUTCMonth(), {
        month: MONTHS[d.getUTCMonth()],
        revenue: 0,
        appointments: 0,
      });
    }
    for (const r of sixMonthRows) {
      const point = buckets.get(r.date.getUTCFullYear() * 12 + r.date.getUTCMonth());
      if (point) {
        point.revenue += r.price ?? 0;
        point.appointments += 1;
      }
    }
    const revenueSeries: RevenuePoint[] = [...buckets.values()];

    // --- Weekly bookings (Mon..Sun) ---
    const weekCounts = new Array(7).fill(0);
    for (const r of weekRows) {
      weekCounts[(r.date.getUTCDay() + 6) % 7] += 1;
    }
    const weeklyBookings: WeekdayCount[] = WEEKDAYS.map((day, i) => ({
      day,
      value: weekCounts[i],
    }));

    // --- Service mix by category ---
    const serviceIds = mixGroups
      .map((g) => g.serviceId)
      .filter((id): id is string => id !== null);
    const services = serviceIds.length
      ? await db.service.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, category: { select: { name: true } } },
        })
      : [];
    const categoryByService = new Map(services.map((s) => [s.id, s.category.name]));
    const byCategory = new Map<string, number>();
    for (const g of mixGroups) {
      const name = (g.serviceId && categoryByService.get(g.serviceId)) || "Other";
      byCategory.set(name, (byCategory.get(name) ?? 0) + g._count._all);
    }
    const mixTotal = [...byCategory.values()].reduce((a, b) => a + b, 0);
    const servicePopularity: ServiceMixSlice[] = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        value: mixTotal ? Math.round((count / mixTotal) * 100) : 0,
        color: MIX_COLORS[i % MIX_COLORS.length],
      }));

    const stats: DashboardStats = {
      revenueThisMonth: thisMonthAgg._sum.price ?? 0,
      revenueChange: pctChange(thisMonthAgg._sum.price ?? 0, lastMonthAgg._sum.price ?? 0),
      appointmentsThisMonth: thisMonthAgg._count._all,
      appointmentsChange: pctChange(thisMonthAgg._count._all, lastMonthAgg._count._all),
      newCustomers: newCustThis,
      newCustomersChange: pctChange(newCustThis, newCustLast),
      avgRating: round1(ratingAll._avg.rating ?? 0),
      ratingChange: round1((ratingThis._avg.rating ?? 0) - (ratingLast._avg.rating ?? 0)),
    };

    return {
      stats,
      revenueSeries,
      servicePopularity,
      weeklyBookings,
      today: todayRows.map(toAppointmentDto),
      recent: recentRows.map(toAppointmentDto),
    };
  },
};
