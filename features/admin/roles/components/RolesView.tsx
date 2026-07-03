"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, ShieldIcon, UsersIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { permissionCatalog } from "@/lib/auth/permissions"
import type { Role } from "@/lib/admin/types"
import { useRoles } from "../hooks/queries"
import { useCreateRole, useDeleteRole, useUpdateRole } from "../hooks/mutations"
import {
  createRoleSchema,
  type CreateRoleInput,
} from "../validations/role.schema"

const groups = Array.from(new Set(permissionCatalog.map((p) => p.group)))

const blank: CreateRoleInput = {
  name: "",
  description: "",
  permissions: [],
}

export function RolesView() {
  const { data: items = [] } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: blank,
  })
  const permissions = form.watch("permissions") ?? []

  const permLabel = useMemo(
    () => new Map(permissionCatalog.map((p) => [p.key, p.label])),
    []
  )

  function openCreate() {
    setEditing(null)
    form.reset(blank)
    setOpen(true)
  }
  function openEdit(r: Role) {
    setEditing(r)
    form.reset({ name: r.name, description: r.description, permissions: r.permissions })
    setOpen(true)
  }
  function togglePerm(key: string) {
    const current = form.getValues("permissions") ?? []
    form.setValue(
      "permissions",
      current.includes(key) ? current.filter((p) => p !== key) : [...current, key]
    )
  }
  async function onSubmit(values: CreateRoleInput) {
    if (editing) {
      await updateRole.mutateAsync({ id: editing.id, input: values })
    } else {
      await createRole.mutateAsync(values)
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Define what each role can see and do in the admin panel."
      >
        <Button onClick={openCreate}>
          <PlusIcon />
          Add role
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} className="gap-4 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldIcon className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {r.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UsersIcon className="size-3.5" />
                    {r.staffCount} member{r.staffCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <RowActions
                onEdit={() => openEdit(r)}
                onDelete={() => setDeleteId(r.id)}
                editLabel="Edit role"
              />
            </div>

            <p className="text-sm text-muted-foreground">{r.description}</p>

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {r.permissions.length === permissionCatalog.length
                  ? "Full access"
                  : `${r.permissions.length} permissions`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.slice(0, 5).map((p) => (
                  <Badge key={p} variant="info">
                    {permLabel.get(p) ?? p}
                  </Badge>
                ))}
                {r.permissions.length > 5 && (
                  <Badge variant="secondary">
                    +{r.permissions.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "Add role"}</DialogTitle>
            <DialogDescription>
              Name the role and choose its permissions.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Stylist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is this role responsible for?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">Permissions</p>
                  {groups.map((group) => (
                    <div key={group} className="space-y-2">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {group}
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {permissionCatalog
                          .filter((p) => p.group === group)
                          .map((p) => (
                            <label
                              key={p.key}
                              className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
                            >
                              <Checkbox
                                checked={permissions.includes(p.key)}
                                onCheckedChange={() => togglePerm(p.key)}
                              />
                              {p.label}
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editing ? "Save changes" : "Create role"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete role?"
        description="Staff assigned to this role will need reassigning."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteRole.mutate(deleteId)}
      />
    </>
  )
}
