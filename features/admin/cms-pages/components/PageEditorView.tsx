"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  Maximize2Icon,
  Minimize2Icon,
  MonitorIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SmartphoneIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ImagePickerField } from "@/components/admin/media-picker"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Block, BlockType, CmsPage } from "@/lib/admin/types"
import { formatDate } from "@/lib/admin/format"
import { blockGroups, blockMap, blockTypes } from "../block-registry"
import { usePage } from "../hooks/queries"
import { useUpdatePage } from "../hooks/mutations"
import { BlockEditor } from "./BlockEditor"
import { PagePreview } from "./BlockPreview"

export function PageEditorView({ pageId }: { pageId: string }) {
  const { data: loaded, isLoading } = usePage(pageId)
  const updatePage = useUpdatePage()
  const [page, setPage] = useState<CmsPage | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [seoOpen, setSeoOpen] = useState(false)
  const seededId = useRef<string | null>(null)

  // Seed local editor state once per page; later background refetches (e.g.
  // after a save) won't clobber in-progress edits.
  useEffect(() => {
    if (loaded && seededId.current !== loaded.id) {
      setPage(loaded)
      setSelectedId(loaded.blocks[0]?.id ?? null)
      seededId.current = loaded.id
    }
  }, [loaded])

  if (!page) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        {isLoading ? "Loading page…" : "Page not found."}
      </div>
    )
  }

  const selected = page.blocks.find((b) => b.id === selectedId) ?? null

  const setBlocks = (blocks: Block[]) =>
    setPage((p) => (p ? { ...p, blocks } : p))

  const setSeo = (patch: Partial<CmsPage["seo"]>) =>
    setPage((p) => (p ? { ...p, seo: { ...p.seo, ...patch } } : p))

  function addBlock(type: BlockType) {
    const meta = blockMap.get(type)!
    const block: Block = {
      id: `b-${Date.now()}`,
      type,
      visible: true,
      data: structuredClone(meta.defaultData),
    }
    setBlocks([...page!.blocks, block])
    setSelectedId(block.id)
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= page!.blocks.length) return
    const next = [...page!.blocks]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setBlocks(next)
  }

  async function save(status: "draft" | "published") {
    if (!page) return
    const updated = await updatePage.mutateAsync({
      id: page.id,
      input: { status, blocks: page.blocks, seo: page.seo },
    })
    setPage(updated)
    seededId.current = updated.id
  }

  return (
    <>
      <PageHeader title="Edit page" description={`Editing “${page.title}” · ${page.slug}`}>
        <Button variant="outline" asChild>
          <Link href="/admin/cms/pages">
            <ArrowLeftIcon />
            Back to pages
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => save("draft")}
          disabled={updatePage.isPending}
        >
          <SaveIcon />
          Save draft
        </Button>
        <Button onClick={() => save("published")} disabled={updatePage.isPending}>
          {updatePage.isPending ? "Saving…" : "Publish"}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={page.status} />
        <span className="text-sm text-muted-foreground">
          Last updated {formatDate(page.updatedAt)}
        </span>
      </div>

      {/* Page SEO — meta title/description/share image for this page. */}
      <Card className="gap-0 p-0">
        <button
          type="button"
          onClick={() => setSeoOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left"
        >
          <span className="flex items-center gap-2">
            <SearchIcon className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Page SEO</span>
            <span className="text-xs text-muted-foreground">
              Meta title, description &amp; share image
            </span>
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              seoOpen && "rotate-180"
            )}
          />
        </button>
        {seoOpen && (
          <div className="space-y-5 border-t border-border px-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="seo-title">Meta title</Label>
              <Input
                id="seo-title"
                value={page.seo.title}
                placeholder={page.title}
                onChange={(e) => setSeo({ title: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use the page title. The site title template is applied automatically.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description">Meta description</Label>
              <Textarea
                id="seo-description"
                value={page.seo.description}
                onChange={(e) => setSeo({ description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to fall back to the site default description.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Share image (OG)</Label>
              <ImagePickerField
                value={page.seo.ogImage}
                onChange={(url) => setSeo({ ogImage: url })}
              />
            </div>
          </div>
        )}
      </Card>

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          !previewExpanded && "xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,440px)]"
        )}
      >
        {/* Block list */}
        {!previewExpanded && (
        <Card className="gap-0 p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-foreground">Blocks</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlusIcon />
                  Add
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 w-56 overflow-y-auto">
                {blockGroups.map((group) => (
                  <div key={group}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {group}
                    </DropdownMenuLabel>
                    {blockTypes
                      .filter((bt) => bt.group === group)
                      .map((bt) => {
                        const Icon = bt.icon
                        return (
                          <DropdownMenuItem key={bt.type} onClick={() => addBlock(bt.type)}>
                            <Icon />
                            {bt.label}
                          </DropdownMenuItem>
                        )
                      })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ul className="space-y-1">
            {page.blocks.map((b, i) => {
              const meta = blockMap.get(b.type)!
              const Icon = meta.icon
              const isSelected = b.id === selectedId
              return (
                <li
                  key={b.id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== i) move(dragIndex, i)
                    setDragIndex(null)
                  }}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-lg border px-2 py-2 transition-colors",
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "border-transparent hover:bg-accent",
                    !b.visible && "opacity-55"
                  )}
                >
                  <GripVerticalIcon className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setSelectedId(b.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {meta.label}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={b.visible ? "Hide block" : "Show block"}
                    onClick={() =>
                      setBlocks(page.blocks.map((x) => (x.id === b.id ? { ...x, visible: !x.visible } : x)))
                    }
                    className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                  >
                    {b.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete block"
                    onClick={() => {
                      setBlocks(page.blocks.filter((x) => x.id !== b.id))
                      if (selectedId === b.id) setSelectedId(null)
                    }}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </li>
              )
            })}
            {page.blocks.length === 0 && (
              <li className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                No blocks. Add one to begin.
              </li>
            )}
          </ul>
        </Card>
        )}

        {/* Block editor */}
        {!previewExpanded && (
        <Card className="gap-0 p-5">
          {selected ? (
            <>
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                {(() => {
                  const Icon = blockMap.get(selected.type)!.icon
                  return <Icon className="size-4 text-primary" />
                })()}
                <span className="font-heading font-semibold text-foreground">
                  {blockMap.get(selected.type)!.label}
                </span>
              </div>
              <BlockEditor
                block={selected}
                onChange={(data) =>
                  setBlocks(page.blocks.map((x) => (x.id === selected.id ? { ...x, data } : x)))
                }
              />
            </>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Select a block to edit its content.
            </div>
          )}
        </Card>
        )}

        {/* Live preview */}
        <Card className="gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground">Preview</span>
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant={device === "desktop" ? "secondary" : "ghost"}
                onClick={() => setDevice("desktop")}
                aria-label="Desktop preview"
              >
                <MonitorIcon />
              </Button>
              <Button
                size="icon-sm"
                variant={device === "mobile" ? "secondary" : "ghost"}
                onClick={() => setDevice("mobile")}
                aria-label="Mobile preview"
              >
                <SmartphoneIcon />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setPreviewExpanded((v) => !v)}
                aria-label={previewExpanded ? "Collapse preview" : "Expand preview"}
              >
                {previewExpanded ? <Minimize2Icon /> : <Maximize2Icon />}
              </Button>
            </div>
          </div>
          <div
            className={cn(
              "overflow-y-auto bg-neutral-100 p-4",
              previewExpanded ? "max-h-[85vh]" : "max-h-[70vh]"
            )}
          >
            <div
              className={cn(
                "mx-auto overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition-all",
                device === "mobile" ? "max-w-[390px]" : "w-full"
              )}
            >
              <PagePreview blocks={page.blocks} />
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
