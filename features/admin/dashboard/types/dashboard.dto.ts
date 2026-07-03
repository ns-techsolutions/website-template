import type { Appointment } from "@/lib/admin/types";

// Aggregated, ready-to-render payload for the admin dashboard. Every field is
// derived from this salon's database (bookings, services, customers, reviews).

export interface DashboardStats {
  revenueThisMonth: number;
  revenueChange: number; // % vs last month
  appointmentsThisMonth: number;
  appointmentsChange: number;
  newCustomers: number;
  newCustomersChange: number;
  avgRating: number; // 0..5
  ratingChange: number; // absolute change vs last month
}

export interface RevenuePoint {
  month: string; // short month label, e.g. "Jun"
  revenue: number;
  appointments: number;
}

export interface ServiceMixSlice {
  name: string; // category name
  value: number; // share of bookings, %
  color: string;
}

export interface WeekdayCount {
  day: string; // "Mon".."Sun"
  value: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueSeries: RevenuePoint[];
  servicePopularity: ServiceMixSlice[];
  weeklyBookings: WeekdayCount[];
  today: Appointment[];
  recent: Appointment[];
}
