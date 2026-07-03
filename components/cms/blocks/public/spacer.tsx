import type { PublicBlockProps, AnyData } from "./types"

export function SpacerBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return <div style={{ height: Number(d.size) || 0 }} />
}
