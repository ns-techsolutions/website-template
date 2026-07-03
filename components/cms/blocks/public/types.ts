import type { Block } from "@/lib/admin/types"
import type { SalonContent } from "@/lib/cms/public"

export interface PublicBlockProps {
  block: Block
  salon: SalonContent | null
}

export type AnyData = Record<string, unknown>
