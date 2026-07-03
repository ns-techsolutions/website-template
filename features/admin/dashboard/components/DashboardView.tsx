"use client"

import {
  CalendarDaysIcon,
  DollarSignIcon,
  StarIcon,
  UserPlusIcon,
} from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatCard } from "@/components/admin/stat-card"
import { StatusBadge } from "@/components/admin/status-badge"
import {
  AreaTrendChart,
  DonutChart,
  MiniBarChart,
} from "@/components/admin/charts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatShortDate, gbp } from "@/lib/admin/format"
import { useDashboard } from "../hooks/queries"

export function DashboardView() {
  const { data, isLoading } = useDashboard()

  const stats = data?.stats
  const today = data?.today ?? []
  const recent = data?.recent ?? []

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening at your salon."
      >
        <Button variant="outline">This month</Button>
        <Button>Export report</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={gbp(stats?.revenueThisMonth ?? 0)}
          change={stats?.revenueChange}
          icon={DollarSignIcon}
        />
        <StatCard
          label="Appointments"
          value={String(stats?.appointmentsThisMonth ?? 0)}
          change={stats?.appointmentsChange}
          icon={CalendarDaysIcon}
        />
        <StatCard
          label="New customers"
          value={String(stats?.newCustomers ?? 0)}
          change={stats?.newCustomersChange}
          icon={UserPlusIcon}
        />
        <StatCard
          label="Avg. rating"
          value={(stats?.avgRating ?? 0).toFixed(1)}
          change={stats?.ratingChange}
          suffix=""
          icon={StarIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaTrendChart
              data={(data?.revenueSeries ?? []).map((r) => ({
                label: r.month,
                value: r.revenue,
              }))}
              format={gbp}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service mix</CardTitle>
            <CardDescription>Share of bookings by category</CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.servicePopularity.length > 0 ? (
              <DonutChart data={data.servicePopularity} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No bookings yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bookings this week</CardTitle>
            <CardDescription>Appointments per day</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={data?.weeklyBookings ?? []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s schedule</CardTitle>
            <CardDescription>
              {today.length} appointment{today.length === 1 ? "" : "s"} booked for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {today.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex w-14 shrink-0 flex-col items-center rounded-md bg-muted py-1">
                  <span className="text-sm font-semibold text-foreground">{a.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.service}
                    {a.staff ? ` · ${a.staff}` : ""}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {today.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {isLoading ? "Loading…" : "Nothing booked for today."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent appointments</CardTitle>
          <CardDescription>Latest bookings across all services</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="pl-6 font-medium text-foreground">{a.reference}</TableCell>
                  <TableCell>{a.customer}</TableCell>
                  <TableCell>{a.service}</TableCell>
                  <TableCell>{a.staff || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatShortDate(a.date)} · {a.time}
                  </TableCell>
                  <TableCell className="font-medium">{gbp(a.price)}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {isLoading ? "Loading…" : "No appointments yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
