"use client"

import { useRef, useState } from "react"
import { ImageIcon, UploadIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMedia } from "@/features/admin/cms-media/hooks/queries"
import { useUploadMedia } from "@/features/admin/cms-media/hooks/mutations"

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}) {
  const { data: mediaAssets = [], isLoading } = useMedia()
  const uploadMedia = useUploadMedia()
  const fileRef = useRef<HTMLInputElement>(null)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const asset = await uploadMedia.mutateAsync(file).catch(() => null)
    if (asset) {
      onSelect(asset.url)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <DialogTitle>Select image</DialogTitle>
              <DialogDescription>
                Choose an image from the media library, or upload a new one.
              </DialogDescription>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploadMedia.isPending}
            >
              <UploadIcon />
              {uploadMedia.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </DialogHeader>
        {uploadMedia.isPending && (
          <div className="space-y-1.5">
            <Progress value={uploadMedia.progress ?? 0} />
            <p className="text-right text-xs text-muted-foreground">
              {uploadMedia.progress ?? 0}%
            </p>
          </div>
        )}
        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {!isLoading && mediaAssets.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No media yet. Use the Upload button above to add your first image.
            </p>
          )}
          {mediaAssets.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m.url)
                onOpenChange(false)
              }}
              className="group overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.name}
                className="aspect-square w-full bg-muted object-cover"
              />
              <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ImagePickerField({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (url: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "Replace" : "Choose image"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <XIcon />
            Remove
          </Button>
        )}
      </div>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={onChange} />
    </div>
  )
}
