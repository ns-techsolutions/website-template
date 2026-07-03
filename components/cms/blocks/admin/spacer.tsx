import type { AdminBlockProps, AnyData } from "./types"

export function SpacerBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return <div style={{ height: Number(d.size) || 0 }} />
}
