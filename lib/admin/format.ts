export const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

/** Whole-unit money in the salon's currency, e.g. formatMoney(50, "gbp") → "£50". */
export const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: (currency || "gbp").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)

/** "17:30" → "5:30 PM". Falls back to the input if it isn't a valid HH:mm. */
export const formatTime12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const period = h < 12 ? "AM" : "PM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
