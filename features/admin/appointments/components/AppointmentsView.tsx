"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, ClockIcon, PlusIcon, SearchIcon } from "lucide-react"
import { format, parse } from "date-fns"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RowActions } from "@/components/admin/row-actions"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PhoneInput } from "@/components/common/PhoneInput"
import { useSalonSettings } from "@/features/admin/salon-settings/hooks/queries"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Appointment, AppointmentStatus } from "@/lib/admin/types"
import { formatShortDate, gbp } from "@/lib/admin/format"
import { formatSlotLabel } from "@/lib/admin/time-slots"
import { useServices } from "@/features/admin/services/hooks/queries"
import { useStaff } from "@/features/admin/staff/hooks/queries"
import { useAvailability, useCatalogHours } from "@/features/catalog/hooks/queries"
import { AvailabilityCalendar } from "@/features/catalog/components/AvailabilityCalendar"
import { useAppointments } from "../hooks/queries"
import {
  useCreateAppointment,
  useDeleteAppointment,
  useRefundAppointment,
  useUpdateAppointment,
} from "../hooks/mutations"
import {
  createAppointmentFormSchema,
  type CreateAppointmentFormInput,
} from "../validations/appointment.schema"
import { SummaryTile } from "./SummaryTile"

const STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no-show",
]

// Sentinel for the "Any available stylist" option (Radix Select needs a value).
const ANY_STAFF = "any"

const blank: CreateAppointmentFormInput = {
  customer: "",
  email: "",
  phone: "",
  serviceId: "",
  staffId: ANY_STAFF,
  date: "",
  time: "",
  status: "pending",
  override: false,
}

export function AppointmentsView() {
  const { data: items = [] } = useAppointments()
  const { data: salonProfile } = useSalonSettings()
  const { data: hoursData } = useCatalogHours()
  const { data: services = [] } = useServices()
  const { data: staff = [] } = useStaff()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const deleteAppointment = useDeleteAppointment()
  const refundAppointment = useRefundAppointment()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [refundId, setRefundId] = useState<string | null>(null)

  const form = useForm<CreateAppointmentFormInput>({
    resolver: zodResolver(createAppointmentFormSchema),
    defaultValues: blank,
  })

  // Availability is duration- and staff-aware, exactly like the customer flow.
  const watchDate = form.watch("date")
  const watchServiceId = form.watch("serviceId")
  const watchStaffId = form.watch("staffId")
  const staffParam =
    watchStaffId && watchStaffId !== ANY_STAFF ? watchStaffId : undefined
  const availability = useAvailability(
    watchDate || undefined,
    watchServiceId || undefined,
    staffParam,
  )
  const timeSlots = useMemo(() => {
    const set = new Set(availability.data ?? [])
    // When editing, keep the booking's own slot selectable (the public
    // availability feed counts it as taken; the server excludes it on save).
    if (editing?.time) set.add(editing.time)
    return [...set].sort()
  }, [availability.data, editing])

  const filtered = useMemo(
    () =>
      items.filter((a) => {
        const q = query.toLowerCase()
        const matchesQ =
          a.customer.toLowerCase().includes(q) ||
          a.reference.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q)
        const matchesS = status === "all" || a.status === status
        return matchesQ && matchesS
      }),
    [items, query, status]
  )

  const counts = useMemo(
    () => ({
      total: items.length,
      confirmed: items.filter((a) => a.status === "confirmed").length,
      pending: items.filter((a) => a.status === "pending").length,
      completed: items.filter((a) => a.status === "completed").length,
    }),
    [items]
  )

  function openCreate() {
    setEditing(null)
    form.reset({
      ...blank,
      serviceId: services[0]?.id ?? "",
    })
    setOpen(true)
  }

  function openEdit(a: Appointment) {
    setEditing(a)
    form.reset({
      customer: a.customer,
      email: a.email ?? "",
      phone: a.phone,
      serviceId: a.serviceId ?? "",
      staffId: a.staffId ?? ANY_STAFF,
      date: a.date,
      time: a.time,
      status: a.status,
      override: false,
    })
    setOpen(true)
  }

  async function onSubmit(values: CreateAppointmentFormInput) {
    // Drop the "any stylist" sentinel and the empty email before sending.
    const payload = {
      ...values,
      email: values.email || undefined,
      staffId:
        values.staffId && values.staffId !== ANY_STAFF
          ? values.staffId
          : undefined,
    }
    if (editing) {
      await updateAppointment.mutateAsync({ id: editing.id, input: payload })
    } else {
      await createAppointment.mutateAsync(payload)
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        description="View, schedule and manage customer bookings."
      >
        <Button onClick={openCreate}>
          <PlusIcon />
          New appointment
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile label="Total bookings" value={counts.total} />
        <SummaryTile label="Confirmed" value={counts.confirmed} />
        <SummaryTile label="Pending" value={counts.pending} />
        <SummaryTile label="Completed" value={counts.completed} />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, reference or service…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Date &amp; time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="pl-4 font-medium text-foreground">
                  {a.reference}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{a.customer}</div>
                  <div className="text-xs text-muted-foreground">{a.phone}</div>
                </TableCell>
                <TableCell>{a.service}</TableCell>
                <TableCell>{a.staff}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatShortDate(a.date)} · {a.time}
                </TableCell>
                <TableCell className="font-medium">{gbp(a.price)}</TableCell>
                <TableCell>
                  <StatusBadge status={a.status} />
                </TableCell>
                <TableCell>
                  {a.paymentStatus && (
                    <StatusBadge status={a.paymentStatus} />
                  )}
                </TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => openEdit(a)}
                    onRefund={
                      a.paymentStatus === "paid"
                        ? () => setRefundId(a.id)
                        : undefined
                    }
                    onDelete={() => setDeleteId(a.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No appointments match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
          <span>
            Showing {filtered.length} of {items.length} appointments
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit appointment" : "New appointment"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the booking details below."
                : "Fill in the details to schedule a new booking."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Customer name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Hannah Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          defaultCountry={salonProfile?.defaultCountry}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff member</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ANY_STAFF}>
                            Any available stylist
                          </SelectItem>
                          {staff.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => {
                    // The form field is a "yyyy-MM-dd" string; the calendar speaks
                    // `Date`. Parse as a *local* date so the day never shifts.
                    const selectedDate = field.value
                      ? parse(field.value, "yyyy-MM-dd", new Date())
                      : undefined
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={`justify-start text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 size-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <AvailabilityCalendar
                              selected={selectedDate}
                              onSelect={(d) => {
                                field.onChange(d ? format(d, "yyyy-MM-dd") : "")
                                // Slot list depends on the date — drop the old pick.
                                form.setValue("time", "")
                              }}
                              openingHours={hoursData?.openingHours}
                              closures={hoursData?.closures}
                              allowClosedDates
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Time</FormLabel>
                      {!watchDate || !watchServiceId ? (
                        <p className="text-sm text-muted-foreground">
                          Choose a service and date to see open times.
                        </p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {availability.isLoading
                            ? "Loading times…"
                            : "No open times for this date — pick another day, or tick “Force booking” to overbook."}
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => field.onChange(slot)}
                              aria-pressed={field.value === slot}
                              className={`flex h-9 items-center justify-center gap-1.5 rounded-md border text-sm transition-colors ${
                                field.value === slot
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input hover:border-primary"
                              }`}
                            >
                              <ClockIcon className="size-3.5" />
                              {formatSlotLabel(slot)}
                            </button>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as AppointmentStatus)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="override"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 flex flex-row items-start gap-3 rounded-md border border-input p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">
                          Force booking (overbook)
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Skip the availability check to squeeze in a walk-in even
                          when the staff member or slot is already taken.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editing ? "Save changes" : "Create appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete appointment?"
        description="This booking will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) deleteAppointment.mutate(deleteId)
        }}
      />

      <ConfirmDialog
        open={refundId !== null}
        onOpenChange={(o) => !o && setRefundId(null)}
        title="Refund deposit?"
        description="The paid deposit will be refunded to the customer via Stripe. This ignores the cancellation window and can't be undone."
        confirmLabel="Refund"
        onConfirm={() => {
          if (refundId) refundAppointment.mutate(refundId)
        }}
      />
    </>
  )
}
