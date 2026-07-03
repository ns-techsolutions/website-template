"use client"

import { useMemo, useRef, useState } from "react"
import { CopyIcon, SearchIcon, Trash2Icon, UploadIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/admin/format"
import { useMedia } from "../hooks/queries"
import { useDeleteMedia, useUploadMedia } from "../hooks/mutations"

export function MediaView() {
  const { data: assets = [], isLoading } = useMedia()
  const uploadMedia = useUploadMedia()
  const deleteMedia = useDeleteMedia()
  const [query, setQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  // Tracks position within a multi-file upload batch for the "(n of m)" label.
  const [batch, setBatch] = useState<{ current: number; total: number } | null>(
    null
  )
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () => assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())),
    [assets, query]
  )

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    for (let i = 0; i < files.length; i++) {
      setBatch({ current: i + 1, total: files.length })
      // Upload sequentially so the list updates incrementally.
      await uploadMedia.mutateAsync(files[i]).catch(() => {})
    }
    setBatch(null)
  }

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Images available to use across your website content."
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFiles}
        />
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={uploadMedia.isPending}
        >
          <UploadIcon />
          {uploadMedia.isPending ? "Uploading…" : "Upload"}
        </Button>
      </PageHeader>

      {uploadMedia.isPending && (
        <div className="max-w-md space-y-1.5">
          <Progress value={uploadMedia.progress ?? 0} />
          <p className="text-xs text-muted-foreground">
            {batch && batch.total > 1
              ? `Uploading ${batch.current} of ${batch.total} · ${uploadMedia.progress ?? 0}%`
              : `Uploading · ${uploadMedia.progress ?? 0}%`}
          </p>
        </div>
      )}

      <div className="relative max-w-md">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search media…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((a) => (
          <Card key={a.id} className="group gap-0 overflow-hidden p-0">
            <div className="relative aspect-square overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.name} className="size-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon-sm"
                  variant="secondary"
                  aria-label="Copy URL"
                  onClick={() => navigator.clipboard?.writeText(a.url)}
                >
                  <CopyIcon />
                </Button>
                <Button
                  size="icon-sm"
                  variant="secondary"
                  aria-label="Delete"
                  onClick={() => setDeleteId(a.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <div className="p-2.5">
              <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
              <p className="text-xs text-muted-foreground">
                {a.width}×{a.height} · {a.sizeKb} KB
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(a.uploadedAt)}</p>
            </div>
          </Card>
        ))}
        {!isLoading && filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            {assets.length === 0
              ? "No media yet. Upload your first image."
              : "No media found."}
          </p>
        )}
        {isLoading && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            Loading media…
          </p>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete media?"
        description="This asset will be removed from the library and storage."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMedia.mutate(deleteId)}
      />
    </>
  )
}
