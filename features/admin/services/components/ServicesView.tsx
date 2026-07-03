"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ClockIcon, PlusIcon, SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RowActions } from "@/components/admin/row-actions"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import type { Service } from "@/lib/admin/types"
import { gbp } from "@/lib/admin/format"
import { useServiceCategories } from "@/features/admin/service-categories/hooks/queries"
import { useServices } from "../hooks/queries"
import {
  useCreateService,
  useDeleteService,
  useUpdateService,
} from "../hooks/mutations"
import {
  createServiceSchema,
  type CreateServiceInput,
} from "../validations/service.schema"

const blank: CreateServiceInput = {
  name: "",
  categoryId: "",
  description: "",
  price: 50,
  duration: 45,
  status: "active",
  requiresDeposit: false,
  depositAmount: null,
}

export function ServicesView() {
  const { data: items = [] } = useServices()
  const { data: serviceCategories = [] } = useServiceCategories()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: blank,
  })
  const requiresDeposit = form.watch("requiresDeposit")

  const filtered = useMemo(
    () =>
      items.filter((s) => {
        const matchesQ = s.name.toLowerCase().includes(query.toLowerCase())
        const matchesC = category === "all" || s.categoryId === category
        return matchesQ && matchesC
      }),
    [items, query, category]
  )

  function openCreate() {
    setEditing(null)
    form.reset({
      ...blank,
      categoryId: serviceCategories[0]?.id ?? "",
    })
    setOpen(true)
  }
  function openEdit(s: Service) {
    setEditing(s)
    form.reset({
      name: s.name,
      categoryId: s.categoryId,
      description: s.description,
      price: s.price,
      duration: s.duration,
      status: s.status,
      requiresDeposit: s.requiresDeposit ?? false,
      depositAmount: s.depositAmount ?? null,
    })
    setOpen(true)
  }
  async function onSubmit(values: CreateServiceInput) {
    const input = {
      ...values,
      depositAmount: values.requiresDeposit ? (values.depositAmount ?? null) : null,
    }
    if (editing) {
      await updateService.mutateAsync({ id: editing.id, input })
    } else {
      await createService.mutateAsync(input)
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Services"
        description="Manage the treatments and services offered at Reine."
      >
        <Button onClick={openCreate}>
          <PlusIcon />
          Add service
        </Button>
      </PageHeader>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 w-full sm:w-52">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {serviceCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="pl-4">
                  <div className="font-medium text-foreground">{s.name}</div>
                  <div className="max-w-xs truncate text-xs text-muted-foreground">
                    {s.description}
                  </div>
                </TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <ClockIcon className="size-3.5" />
                    {s.duration} min
                  </span>
                </TableCell>
                <TableCell className="font-medium">{gbp(s.price)}</TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => openEdit(s)}
                    onDelete={() => setDeleteId(s.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No services found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
            <DialogDescription>
              Define the service name, category, pricing and duration.
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
                      <FormLabel>Service name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Signature Glow Facial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short description shown to customers…"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                        <Label htmlFor="svc-active" className="font-normal">
                          Active &amp; bookable
                        </Label>
                        <Switch
                          id="svc-active"
                          checked={field.value === "active"}
                          onCheckedChange={(c) => field.onChange(c ? "active" : "inactive")}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiresDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                        <Label htmlFor="svc-deposit" className="font-normal">
                          Requires deposit
                        </Label>
                        <Switch
                          id="svc-deposit"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {requiresDeposit && (
                  <FormField
                    control={form.control}
                    name="depositAmount"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Deposit amount (£)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 20"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.valueAsNumber
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editing ? "Save changes" : "Add service"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete service?"
        description="This service will be removed from the menu."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) deleteService.mutate(deleteId)
        }}
      />
    </>
  )
}
