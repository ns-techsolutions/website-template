"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon, PhoneIcon, PlusIcon, SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RowActions } from "@/components/admin/row-actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/common/PhoneInput"
import { useSalonSettings } from "@/features/admin/salon-settings/hooks/queries"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Customer } from "@/lib/admin/types"
import { formatDate, gbp, initials } from "@/lib/admin/format"
import { useCustomers } from "../hooks/queries"
import { useCreateCustomer, useUpdateCustomer } from "../hooks/mutations"
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from "../validations/customer.schema"
import { SummaryTile } from "./SummaryTile"
import { Stat } from "./Stat"

const blankForm: CreateCustomerInput = { name: "", email: "", phone: "", notes: "" }

export function CustomersView() {
  const { data: items = [] } = useCustomers()
  const { data: salonProfile } = useSalonSettings()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: blankForm,
  })

  const filtered = useMemo(
    () =>
      items.filter((c) => {
        const q = query.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
        )
      }),
    [items, query]
  )

  const totalSpent = items.reduce((s, c) => s + c.totalSpent, 0)
  const totalVisits = items.reduce((s, c) => s + c.visits, 0)

  function openCreate() {
    setEditing(null)
    form.reset(blankForm)
    setOpen(true)
  }
  function openEdit(c: Customer) {
    setEditing(c)
    form.reset({ name: c.name, email: c.email, phone: c.phone, notes: c.notes ?? "" })
    setOpen(true)
  }
  async function onSubmit(values: CreateCustomerInput) {
    if (editing) {
      await updateCustomer.mutateAsync({
        id: editing.id,
        input: { name: values.name, phone: values.phone, notes: values.notes },
      })
    } else {
      await createCustomer.mutateAsync(values)
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Your client list, visit history and lifetime value."
      >
        <Button onClick={openCreate}>
          <PlusIcon />
          Add customer
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile label="Total customers" value={String(items.length)} />
        <SummaryTile label="Active" value={String(items.filter((c) => c.status === "active").length)} />
        <SummaryTile label="Total visits" value={String(totalVisits)} />
        <SummaryTile label="Lifetime revenue" value={gbp(totalSpent)} />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Total spent</TableHead>
              <TableHead>Last visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{c.email}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </TableCell>
                <TableCell>{c.visits}</TableCell>
                <TableCell className="font-medium">{gbp(c.totalSpent)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(c.lastVisit)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell>
                  <RowActions onView={() => setSelected(c)} onEdit={() => openEdit(c)} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer details</DialogTitle>
            <DialogDescription>Profile and visit summary.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    {selected.name}
                  </p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MailIcon className="size-4" /> {selected.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <PhoneIcon className="size-4" /> {selected.phone}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Visits" value={String(selected.visits)} />
                <Stat label="Total spent" value={gbp(selected.totalSpent)} />
                <Stat
                  label="Avg / visit"
                  value={
                    selected.visits > 0
                      ? gbp(Math.round(selected.totalSpent / selected.visits))
                      : "—"
                  }
                />
              </div>
              {selected.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Notes
                    </p>
                    <p className="text-sm text-foreground">{selected.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit customer" : "Add customer"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update contact details and notes."
                : "Create a customer record. They can set a password later via reset."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Hannah Price" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          disabled={!!editing}
                          placeholder="name@email.com"
                          {...field}
                        />
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>Preferences, allergies, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={createCustomer.isPending || updateCustomer.isPending}
                >
                  {editing ? "Save changes" : "Add customer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
