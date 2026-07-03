"use client"

import { useMemo, useState } from "react"
import { Trash2Icon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, initials } from "@/lib/admin/format"
import { useReviews } from "../hooks/queries"
import { useDeleteReview, useUpdateReview } from "../hooks/mutations"
import { Stars } from "./Stars"

export function ReviewsView() {
  const { data: items = [] } = useReviews()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()

  const [tab, setTab] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === "published") return items.filter((r) => r.published)
    if (tab === "pending") return items.filter((r) => !r.published)
    return items
  }, [items, tab])

  const avg =
    items.reduce((s, r) => s + r.rating, 0) / Math.max(items.length, 1)

  const togglePublish = (id: string, published: boolean) =>
    updateReview.mutate({ id, input: { published: !published } })

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate customer feedback and choose what appears on the website."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="gap-1 p-4">
          <p className="text-sm text-muted-foreground">Average rating</p>
          <div className="flex items-center gap-2">
            <p className="font-heading text-2xl font-semibold text-foreground">
              {avg.toFixed(1)}
            </p>
            <Stars rating={Math.round(avg)} />
          </div>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-sm text-muted-foreground">Total reviews</p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            {items.length}
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            {items.filter((r) => r.published).length}
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-sm text-muted-foreground">Awaiting review</p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            {items.filter((r) => !r.published).length}
          </p>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((r) => (
          <Card key={r.id} className="gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(r.customer)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{r.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.service} · {formatDate(r.date)}
                  </p>
                </div>
              </div>
              <Badge variant={r.published ? "success" : "warning"}>
                {r.published ? "Published" : "Pending"}
              </Badge>
            </div>

            <Stars rating={r.rating} />

            <p className="text-sm text-muted-foreground">“{r.comment}”</p>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Switch
                  checked={r.published}
                  onCheckedChange={() => togglePublish(r.id, r.published)}
                />
                Show on website
              </label>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete review"
                onClick={() => setDeleteId(r.id)}
              >
                <Trash2Icon className="text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No reviews in this view.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete review?"
        description="This review will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteReview.mutate(deleteId)}
      />
    </>
  )
}
