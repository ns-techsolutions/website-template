import type { Block } from "@/lib/admin/types"
import type { SalonContent } from "@/lib/cms/public"

import { publicBlockRegistry } from "./blocks/public/registry"

// Full-fidelity public renderer: reproduces the hand-built Reine section styles
// (reine-container, full-bleed hero, original aspect ratios, pill buttons) but
// driven entirely by CMS block data. Each block type's markup lives in its own
// component under ./blocks/public, wired up through `publicBlockRegistry`. The
// compact `PagePreview` is used only for the admin editor's small preview pane.

/** Renders a CMS page's visible blocks with full public-site styling. */
export function PublicBlockRenderer({
  blocks,
  salon = null,
}: {
  blocks: Block[]
  salon?: SalonContent | null
}) {
  return (
    <>
      {blocks
        .filter((b) => b.visible)
        .map((b) => {
          const BlockComponent = publicBlockRegistry[b.type]
          return BlockComponent ? (
            <BlockComponent key={b.id} block={b} salon={salon} />
          ) : null
        })}
    </>
  )
}
