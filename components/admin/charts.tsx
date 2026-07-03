import { cn } from "@/lib/utils"

// Lightweight, dependency-free SVG/CSS charts for the dashboard.

export function AreaTrendChart({
  data,
  height = 240,
  className,
  format = (v) => String(v),
}: {
  data: { label: string; value: number }[]
  height?: number
  className?: string
  format?: (v: number) => string
}) {
  const W = 680
  const H = height

  if (data.length === 0) {
    return (
      <div
        style={{ height }}
        className={cn(
          "flex w-full items-center justify-center text-sm text-muted-foreground",
          className,
        )}
      >
        No data yet
      </div>
    )
  }

  const padX = 8
  const padTop = 16
  const padBottom = 28
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom
  const max = Math.max(...data.map((d) => d.value)) * 1.15 || 1
  const stepX = innerW / Math.max(data.length - 1, 1)

  const pts = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padTop + innerH * (1 - d.value / max),
    ...d,
  }))

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${padTop + innerH} L ${pts[0].x.toFixed(1)} ${padTop + innerH} Z`
  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      role="img"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d3b64" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2d3b64" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((g) => (
        <line
          key={g}
          x1={padX}
          x2={W - padX}
          y1={padTop + innerH * g}
          y2={padTop + innerH * g}
          stroke="#e8eaf0"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#areaFill)" />
      <path
        d={line}
        fill="none"
        stroke="#2d3b64"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#2d3b64" strokeWidth="2" />
          <text
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            {p.label}
          </text>
          <title>{`${p.label}: ${format(p.value)}`}</title>
        </g>
      ))}
    </svg>
  )
}

export function MiniBarChart({
  data,
  className,
}: {
  data: { day: string; value: number }[]
  className?: string
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1
  return (
    <div className={cn("flex h-44 items-end justify-between gap-2", className)}>
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-primary/85 transition-all hover:bg-primary"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.day}: ${d.value}`}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({
  data,
  className,
}: {
  data: { name: string; value: number; color: string }[]
  className?: string
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const radius = 56
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className={cn("flex flex-col items-center gap-5 sm:flex-row sm:gap-8", className)}>
      <div className="relative shrink-0">
        <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
          {data.map((d) => {
            const len = (d.value / total) * circumference
            const seg = (
              <circle
                key={d.name}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="18"
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
              />
            )
            offset += len
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-semibold text-foreground">
            {total}%
          </span>
          <span className="text-xs text-muted-foreground">Bookings</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-1 gap-2.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-foreground">{d.name}</span>
            <span className="ml-auto font-medium text-muted-foreground">
              {d.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
