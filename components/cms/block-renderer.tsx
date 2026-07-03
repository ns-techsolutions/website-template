import type { Block } from "@/lib/admin/types"
import { adminBlockRegistry } from "./blocks/admin/registry"

// Simplified render of a page's blocks, styled to match the public Reine site
// (serif headings, uppercase eyebrows, pill buttons, alternating backgrounds).
// Shared by the admin editor preview and the public site. Each block type's
// markup lives in its own component under ./blocks/admin, wired up through
// `adminBlockRegistry`.

function RenderBlocks({ blocks }: { blocks: Block[] }) {
  const visible = blocks.filter((b) => b.visible)
  if (visible.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">
        No visible blocks to preview.
      </div>
    )
  }
  return (
    <div className="bg-white">
      {visible.map((b) => {
        const BlockComponent = adminBlockRegistry[b.type]
        return BlockComponent ? <BlockComponent key={b.id} block={b} /> : null
      })}
    </div>
  )
}

/** Editor preview (admin) — kept name for backwards compatibility. */
export function PagePreview({ blocks }: { blocks: Block[] }) {
  return <RenderBlocks blocks={blocks} />
}

/** Public-site renderer — same block visuals, used by the marketing pages. */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return <RenderBlocks blocks={blocks} />
}
