import { Card } from "@/components/ui/card"

export function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-heading text-2xl font-semibold ${accent}`}>{value}</p>
    </Card>
  )
}
