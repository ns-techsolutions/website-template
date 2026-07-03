import { Card } from "@/components/ui/card"

export function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-semibold text-foreground">
        {value}
      </p>
    </Card>
  )
}
