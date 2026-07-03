"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarOffIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OpeningHour } from "@/lib/admin/types"
import { formatDate } from "@/lib/admin/format"
import { useOpeningHours } from "../hooks/queries"
import { useUpdateOpeningHours } from "../hooks/mutations"
import {
  updateSalonHoursSchema,
  type UpdateSalonHoursInput,
} from "../validations/opening-hours.schema"

const SLOT_DURATION_OPTIONS = [15, 30, 45, 60, 90]

const DEFAULT_DAYS: OpeningHour[] = [
  { day: "Monday", open: "09:00", close: "18:00", closed: false },
  { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
  { day: "Thursday", open: "09:00", close: "20:00", closed: false },
  { day: "Friday", open: "09:00", close: "20:00", closed: false },
  { day: "Saturday", open: "08:30", close: "17:00", closed: false },
  { day: "Sunday", open: "10:00", close: "16:00", closed: true },
]

export function OpeningHoursView() {
  const { data } = useOpeningHours()
  const updateHours = useUpdateOpeningHours()

  const form = useForm<UpdateSalonHoursInput>({
    resolver: zodResolver(updateSalonHoursSchema),
    defaultValues: {
      openingHours: DEFAULT_DAYS,
      closures: [],
      slotDurationMinutes: 30,
      bufferMinutes: 0,
      cancellationCutoffHours: 24,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset({
        openingHours: data.openingHours.length ? data.openingHours : DEFAULT_DAYS,
        closures: data.closures ?? [],
        slotDurationMinutes: data.slotDurationMinutes,
        bufferMinutes: data.bufferMinutes ?? 0,
        cancellationCutoffHours: data.cancellationCutoffHours ?? 24,
      })
    }
  }, [data, form])

  const hours = form.watch("openingHours")
  const slotDuration = form.watch("slotDurationMinutes")
  const bufferMinutes = form.watch("bufferMinutes")
  const cancellationCutoffHours = form.watch("cancellationCutoffHours")
  const closures = form.watch("closures")

  const [newClosure, setNewClosure] = useState({ date: "", reason: "" })

  const update = (day: string, patch: Partial<OpeningHour>) =>
    form.setValue(
      "openingHours",
      hours.map((h) => (h.day === day ? { ...h, ...patch } : h))
    )

  async function onSubmit(values: UpdateSalonHoursInput) {
    await updateHours.mutateAsync(values)
  }

  function addClosure() {
    if (!newClosure.date) return
    form.setValue("closures", [
      ...closures,
      { id: `c-${Date.now()}`, ...newClosure },
    ])
    setNewClosure({ date: "", reason: "" })
  }

  function removeClosure(id: string) {
    form.setValue(
      "closures",
      closures.filter((x) => x.id !== id)
    )
  }

  return (
    <>
      <PageHeader
        title="Opening Hours"
        description="Set the salon's weekly trading hours and special closures."
      >
        <Button onClick={form.handleSubmit(onSubmit)} disabled={updateHours.isPending}>
          {updateHours.isPending ? "Saving…" : "Save changes"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly schedule</CardTitle>
            <CardDescription>
              Toggle a day off or adjust its opening and closing time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {hours.map((h) => (
              <div
                key={h.day}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="flex w-full items-center gap-3 sm:w-44">
                  <Switch
                    checked={!h.closed}
                    onCheckedChange={(c) => update(h.day, { closed: !c })}
                  />
                  <span className="font-medium text-foreground">{h.day}</span>
                </div>
                {h.closed ? (
                  <Badge variant="secondary" className="w-fit">
                    Closed
                  </Badge>
                ) : (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="time"
                      value={h.open}
                      onChange={(e) => update(h.day, { open: e.target.value })}
                      className="h-9 w-32"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={h.close}
                      onChange={(e) => update(h.day, { close: e.target.value })}
                      className="h-9 w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking slots</CardTitle>
              <CardDescription>
                Define the time period customers can pick when booking online.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Select
                  value={String(slotDuration)}
                  onValueChange={(v) => form.setValue("slotDurationMinutes", Number(v))}
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOT_DURATION_OPTIONS.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {minutes} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  per appointment time slot
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={240}
                  step={5}
                  value={bufferMinutes}
                  onChange={(e) =>
                    form.setValue(
                      "bufferMinutes",
                      Number.isFinite(e.target.valueAsNumber)
                        ? e.target.valueAsNumber
                        : 0,
                    )
                  }
                  className="h-9 w-40"
                />
                <span className="text-sm text-muted-foreground">
                  cleanup buffer after each appointment (minutes)
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={720}
                  step={1}
                  value={cancellationCutoffHours}
                  onChange={(e) =>
                    form.setValue(
                      "cancellationCutoffHours",
                      Number.isFinite(e.target.valueAsNumber)
                        ? e.target.valueAsNumber
                        : 0,
                    )
                  }
                  className="h-9 w-40"
                />
                <span className="text-sm text-muted-foreground">
                  refundable cancellation cutoff before the appointment (hours)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Special closures</CardTitle>
              <CardDescription>
                Holidays and one-off days the salon is closed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {closures.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                      <CalendarOffIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.reason || "Closed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(c.date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove closure"
                      onClick={() => removeClosure(c.id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                ))}
                {closures.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No closures scheduled.
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <Input
                  type="date"
                  value={newClosure.date}
                  onChange={(e) =>
                    setNewClosure((s) => ({ ...s, date: e.target.value }))
                  }
                  className="h-9"
                />
                <Input
                  placeholder="Reason (optional)"
                  value={newClosure.reason}
                  onChange={(e) =>
                    setNewClosure((s) => ({ ...s, reason: e.target.value }))
                  }
                  className="h-9"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addClosure}
                >
                  <PlusIcon />
                  Add closure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
