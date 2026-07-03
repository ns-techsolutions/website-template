"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, TagIcon } from "lucide-react"

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
import type { ServiceCategory } from "@/lib/admin/types"
import { useServiceCategories } from "../hooks/queries"
import {
  useCreateServiceCategory,
  useDeleteServiceCategory,
  useUpdateServiceCategory,
} from "../hooks/mutations"
import {
  createServiceCategorySchema,
  type CreateServiceCategoryInput,
} from "../validations/service-category.schema"

const blank: CreateServiceCategoryInput = {
  name: "",
  description: "",
  status: "active",
}

export function ServiceCategoriesView() {
  const { data: items = [] } = useServiceCategories()
  const createCategory = useCreateServiceCategory()
  const updateCategory = useUpdateServiceCategory()
  const deleteCategory = useDeleteServiceCategory()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<CreateServiceCategoryInput>({
    resolver: zodResolver(createServiceCategorySchema),
    defaultValues: blank,
  })

  function openCreate() {
    setEditing(null)
    form.reset(blank)
    setOpen(true)
  }
  function openEdit(c: ServiceCategory) {
    setEditing(c)
    form.reset({ name: c.name, description: c.description, status: c.status })
    setOpen(true)
  }
  async function onSubmit(values: CreateServiceCategoryInput) {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, input: values })
    } else {
      await createCategory.mutateAsync(values)
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Service Categories"
        description="Organise your services into categories shown on the website."
      >
        <Button onClick={openCreate}>
          <PlusIcon />
          Add category
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="gap-4 p-5">
            <div className="flex items-start justify-between">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TagIcon className="size-5" />
              </span>
              <RowActions
                onEdit={() => openEdit(c)}
                onDelete={() => setDeleteId(c.id)}
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-base font-semibold text-foreground">
                {c.name}
              </h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">
                {c.serviceCount} service{c.serviceCount === 1 ? "" : "s"}
              </span>
              <StatusBadge status={c.status} />
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              Categories group related services together.
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
                      <FormLabel>Category name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Facials" {...field} />
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
                        <Textarea placeholder="What does this category include?" {...field} />
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
                        <Label htmlFor="cat-active" className="font-normal">
                          Visible on website
                        </Label>
                        <Switch
                          id="cat-active"
                          checked={field.value === "active"}
                          onCheckedChange={(c) => field.onChange(c ? "active" : "inactive")}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editing ? "Save changes" : "Add category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete category?"
        description="Services in this category will need to be reassigned."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) deleteCategory.mutate(deleteId)
        }}
      />
    </>
  )
}
