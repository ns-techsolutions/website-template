"use client"

import { useState } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Field } from "@/components/admin/field"
import {
  ImagePickerField,
  MediaPickerDialog,
} from "@/components/admin/media-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Block } from "@/lib/admin/types"
import { useStaff } from "@/features/admin/staff/hooks/queries"
import { blockMap, type BlockField } from "../block-registry"

type Data = Record<string, unknown>

/** Dropdown of active staff for the team block, storing the selected staff id. */
function StaffPickerInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const { data: staff = [] } = useStaff()
  const active = staff.filter((m) => m.status === "active")

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a staff member" />
      </SelectTrigger>
      <SelectContent>
        {active.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ScalarInput({
  field,
  value,
  onChange,
}: {
  field: BlockField
  value: string
  onChange: (v: string) => void
}) {
  switch (field.kind) {
    case "textarea":
      return <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    case "image":
      return <ImagePickerField value={value} onChange={onChange} />
    case "staffPicker":
      return <StaffPickerInput value={value} onChange={onChange} />
    case "number":
      return <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent"
          />
          <Input value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      )
    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o} value={o} className="capitalize">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />
  }
}

export function BlockEditor({
  block,
  onChange,
}: {
  block: Block
  onChange: (data: Data) => void
}) {
  const meta = blockMap.get(block.type)
  const [galleryPicker, setGalleryPicker] = useState(false)
  const d = block.data as Data

  if (!meta) return null

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value })

  const images = Array.isArray(d[meta.imageList?.key ?? ""])
    ? (d[meta.imageList!.key] as string[])
    : []

  const repeaterItems = meta.repeater
    ? (Array.isArray(d[meta.repeater.key]) ? (d[meta.repeater.key] as Data[]) : [])
    : []

  const moveItem = (from: number, to: number) => {
    if (!meta.repeater || to < 0 || to >= repeaterItems.length) return
    const next = [...repeaterItems]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    set(meta.repeater.key, next)
  }

  return (
    <div className="space-y-4">
      {meta.fields.map((f) => (
        <Field key={f.key} label={f.label}>
          <ScalarInput
            field={f}
            value={typeof d[f.key] === "string" || typeof d[f.key] === "number" ? String(d[f.key]) : ""}
            onChange={(v) => set(f.key, f.kind === "number" ? Number(v) : v)}
          />
        </Field>
      ))}

      {/* Image list (gallery) */}
      {meta.imageList && (
        <div className="space-y-2">
          <Label>{meta.imageList.label}</Label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((src, i) => (
              <div key={i} className="group relative overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set(meta.imageList!.key, images.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setGalleryPicker(true)}
              className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              <PlusIcon className="size-5" />
            </button>
          </div>
          <MediaPickerDialog
            open={galleryPicker}
            onOpenChange={setGalleryPicker}
            onSelect={(url) => set(meta.imageList!.key, [...images, url])}
          />
        </div>
      )}

      {/* Repeater (cards / testimonials / stats) */}
      {meta.repeater && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{meta.repeater.itemLabel}s</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set(meta.repeater!.key, [...repeaterItems, { ...meta.repeater!.defaultItem }])}
            >
              <PlusIcon />
              Add
            </Button>
          </div>
          {repeaterItems.map((item, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {meta.repeater!.itemLabel} {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveItem(i, i - 1)}
                    className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUpIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={i === repeaterItems.length - 1}
                    onClick={() => moveItem(i, i + 1)}
                    className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDownIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => set(meta.repeater!.key, repeaterItems.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
              {meta.repeater!.fields.map((sf) => (
                <Field key={sf.key} label={sf.label}>
                  <ScalarInput
                    field={sf}
                    value={String(item[sf.key] ?? "")}
                    onChange={(v) =>
                      set(
                        meta.repeater!.key,
                        repeaterItems.map((it, idx) => (idx === i ? { ...it, [sf.key]: v } : it))
                      )
                    }
                  />
                </Field>
              ))}
            </div>
          ))}
          {repeaterItems.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
              No {meta.repeater.itemLabel.toLowerCase()}s yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
