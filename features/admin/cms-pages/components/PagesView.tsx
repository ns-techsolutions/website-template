"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileTextIcon, PencilIcon, PlusIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RowActions } from "@/components/admin/row-actions"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { formatDate } from "@/lib/admin/format"
import { usePages } from "../hooks/queries"
import { useCreatePage, useDeletePage } from "../hooks/mutations"
import {
  createPageFormSchema,
  type CreatePageFormInput,
} from "../validations/page.schema"

export function PagesView() {
  const { data: items = [], isLoading } = usePages()
  const createPage = useCreatePage()
  const deletePage = useDeletePage()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<CreatePageFormInput>({
    resolver: zodResolver(createPageFormSchema),
    defaultValues: { title: "", slug: "" },
  })

  async function onSubmit(values: CreatePageFormInput) {
    const title = values.title || "Untitled page"
    const slug =
      values.slug || `/${(values.title || "untitled").toLowerCase().replace(/\s+/g, "-")}`
    await createPage.mutateAsync({ title, slug })
    form.reset({ title: "", slug: "" })
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Pages"
        description="Build and publish the pages of your website using content blocks."
      >
        <Button onClick={() => setOpen(true)}>
          <PlusIcon />
          New page
        </Button>
      </PageHeader>

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Page</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Blocks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading pages…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No pages yet. Create your first page to get started.
                </TableCell>
              </TableRow>
            )}
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileTextIcon className="size-4" />
                    </span>
                    <Link
                      href={`/admin/cms/pages/${p.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {p.title}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.slug}</TableCell>
                <TableCell>{p.blocks.length}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild aria-label="Edit page">
                      <Link href={`/admin/cms/pages/${p.id}`}>
                        <PencilIcon />
                      </Link>
                    </Button>
                    <RowActions onDelete={() => setDeleteId(p.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New page</DialogTitle>
            <DialogDescription>Create a blank page, then add content blocks.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pricing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL path</FormLabel>
                      <FormControl>
                        <Input placeholder="/pricing" {...field} />
                      </FormControl>
                      <FormDescription>The route this page lives at</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createPage.isPending}>
                  {createPage.isPending ? "Creating…" : "Create page"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete page?"
        description="This page and its content blocks will be removed."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deletePage.mutate(deleteId)}
      />
    </>
  )
}
