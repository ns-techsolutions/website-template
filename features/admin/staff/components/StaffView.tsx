"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RowActions } from "@/components/admin/row-actions"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/common/PhoneInput"
import { useSalonSettings } from "@/features/admin/salon-settings/hooks/queries"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImagePickerField } from "@/components/admin/media-picker"
import { Badge } from "@/components/ui/badge"
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
import type { StaffMember } from "@/lib/admin/types"
import { formatDate, initials } from "@/lib/admin/format"
import { useRoles } from "@/features/admin/roles/hooks/queries"
import { useStaff } from "../hooks/queries"
import { useCreateStaff, useDeleteStaff, useUpdateStaff } from "../hooks/mutations"
import {
  createStaffSchema,
  type CreateStaffInput,
} from "../validations/staff.schema"

const blank: CreateStaffInput = {
  name: "",
  email: "",
  phone: "",
  roleId: "",
  role: "",
  specialties: [],
  status: "active",
  image: "",
  joinedDate: "2026-06-01",
}

export function StaffView() {
  const { data: items = [] } = useStaff()
  const { data: salonProfile } = useSalonSettings()
  const { data: roles = [] } = useRoles()
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const deleteStaff = useDeleteStaff()

  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [specialtiesText, setSpecialtiesText] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: blank,
  })

  const filtered = useMemo(
    () =>
      items.filter((m) => {
        const q = query.toLowerCase()
        const matchesQ =
          m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        const matchesR = roleFilter === "all" || m.roleId === roleFilter
        return matchesQ && matchesR
      }),
    [items, query, roleFilter]
  )

  function openCreate() {
    setEditing(null)
    form.reset({
      ...blank,
      roleId: roles[0]?.id ?? "",
      role: roles[0]?.name ?? "",
    })
    setSpecialtiesText("")
    setOpen(true)
  }
  function openEdit(m: StaffMember) {
    setEditing(m)
    form.reset({
      name: m.name,
      email: m.email,
      phone: m.phone,
      roleId: m.roleId,
      role: m.role,
      specialties: m.specialties,
      status: m.status,
      image: m.image,
      joinedDate: m.joinedDate,
    })
    setSpecialtiesText(m.specialties.join(", "))
    setOpen(true)
  }
  async function onSubmit(values: CreateStaffInput) {
    const role = roles.find((r) => r.id === values.roleId)
    const input = {
      ...values,
      role: role?.name ?? values.role,
      specialties: specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    if (editing) {
      await updateStaff.mutateAsync({ id: editing.id, input })
    } else {
      await createStaff.mutateAsync(input)
    }
    setOpen(false)
  }

  const activeCount = items.filter((m) => m.status === "active").length

  return (
    <>
      <PageHeader
        title="Staff"
        description="Manage your team members, their roles and contact details."
      >
        <Button onClick={openCreate}>
          <PlusIcon />
          Add staff
        </Button>
      </PageHeader>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {activeCount} active
          </span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10 w-full sm:w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Member</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {m.image && <AvatarImage src={m.image} alt={m.name} />}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{m.email}</div>
                  <div className="text-xs text-muted-foreground">{m.phone}</div>
                </TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {m.specialties.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(m.joinedDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={m.status} />
                </TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => openEdit(m)}
                    onDelete={() => setDeleteId(m.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit staff member" : "Add staff member"}
            </DialogTitle>
            <DialogDescription>
              Add the team member&apos;s details and assign a role.
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
                        <Input placeholder="e.g. Sophia Carter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Photo</FormLabel>
                      <FormControl>
                        <ImagePickerField
                          value={field.value ?? ""}
                          onChange={field.onChange}
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@reine.com" {...field} />
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
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
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
                  name="joinedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joined date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="sm:col-span-2">
                  <FormLabel>Specialties</FormLabel>
                  <FormControl>
                    <Input
                      value={specialtiesText}
                      onChange={(e) => setSpecialtiesText(e.target.value)}
                      placeholder="Hair, Colour, Make-Up"
                    />
                  </FormControl>
                  <FormDescription>Comma separated</FormDescription>
                </FormItem>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                        <Label htmlFor="stf-active" className="font-normal">
                          Active employee
                        </Label>
                        <Switch
                          id="stf-active"
                          checked={field.value === "active"}
                          onCheckedChange={(c) => field.onChange(c ? "active" : "inactive")}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editing ? "Save changes" : "Add staff"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove staff member?"
        description="They will lose access to the admin panel."
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteId) deleteStaff.mutate(deleteId)
        }}
      />
    </>
  )
}
