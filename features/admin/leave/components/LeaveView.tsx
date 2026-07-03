"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, PlusIcon, XIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import type { LeaveType } from "@/lib/admin/types"
import { formatShortDate, initials } from "@/lib/admin/format"
import { useStaff } from "@/features/admin/staff/hooks/queries"
import { useLeaveRequests } from "../hooks/queries"
import { useCreateLeave, useSetLeaveStatus } from "../hooks/mutations"
import {
  createLeaveFormSchema,
  type CreateLeaveFormInput,
} from "../validations/leave.schema"
import { SummaryTile } from "./SummaryTile"

const TYPES: LeaveType[] = ["annual", "sick", "unpaid", "maternity", "other"]

function daysBetween(from: string, to: string) {
  if (!from || !to) return 1
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

export function LeaveView() {
  const { data: items = [] } = useLeaveRequests()
  const { data: staff = [] } = useStaff()
  const createLeave = useCreateLeave()
  const setLeaveStatus = useSetLeaveStatus()

  const [tab, setTab] = useState("all")
  const [open, setOpen] = useState(false)
  const [rejectId, setRejectId] = useState<string | null>(null)

  const form = useForm<CreateLeaveFormInput>({
    resolver: zodResolver(createLeaveFormSchema),
    defaultValues: { staffId: "", type: "annual", from: "", to: "", reason: "" },
  })
  const watchedFrom = form.watch("from")
  const watchedTo = form.watch("to")

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((l) => l.status === tab)),
    [items, tab]
  )

  const counts = useMemo(
    () => ({
      pending: items.filter((l) => l.status === "pending").length,
      approved: items.filter((l) => l.status === "approved").length,
      rejected: items.filter((l) => l.status === "rejected").length,
    }),
    [items]
  )

  const setStatus = (id: string, status: "approved" | "rejected") =>
    setLeaveStatus.mutate({ id, status })

  function openDialog() {
    form.reset({
      staffId: staff[0]?.id ?? "",
      type: "annual",
      from: "",
      to: "",
      reason: "",
    })
    setOpen(true)
  }

  async function onSubmit(values: CreateLeaveFormInput) {
    await createLeave.mutateAsync(values)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Leave Management"
        description="Review and action staff time-off requests."
      >
        <Button onClick={openDialog}>
          <PlusIcon />
          Request leave
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <SummaryTile label="Pending" value={counts.pending} accent="text-[#B76E00]" />
        <SummaryTile label="Approved" value={counts.approved} accent="text-[#1E7E34]" />
        <SummaryTile label="Rejected" value={counts.rejected} accent="text-[#D32F2F]" />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b border-border p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Staff</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {initials(l.staff)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{l.staff}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="info" className="capitalize">
                    {l.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatShortDate(l.from)} – {formatShortDate(l.to)}
                </TableCell>
                <TableCell>{l.days}</TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground">
                  {l.reason}
                </TableCell>
                <TableCell>
                  <StatusBadge status={l.status} />
                </TableCell>
                <TableCell className="pr-4">
                  {l.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-[#1E7E34] text-white hover:bg-[#1E7E34]/90"
                        onClick={() => setStatus(l.id, "approved")}
                      >
                        <CheckIcon />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectId(l.id)}
                      >
                        <XIcon />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="block text-right text-xs text-muted-foreground">
                      Actioned
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No leave requests in this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request leave</DialogTitle>
            <DialogDescription>
              Submit a time-off request on behalf of a staff member.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Staff member</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as LeaveType)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <FormControl>
                    <Input value={daysBetween(watchedFrom, watchedTo)} disabled />
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Reason for the leave request…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit request</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={rejectId !== null}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject leave request?"
        description="The staff member will be notified that their request was declined."
        confirmLabel="Reject"
        onConfirm={() => rejectId && setStatus(rejectId, "rejected")}
      />
    </>
  )
}
