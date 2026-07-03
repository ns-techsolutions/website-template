import { CircleUserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AdminBlockProps, AnyData } from "./types"
import { ACCOUNT_ICONS, FullButton, Heading, Img, LabeledInput, items, s } from "./_shared"

export function AccountBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  const name = s(d.userName)
  const menu = items(d.menu)
  return (
    <div className="bg-white px-6 py-10">
      <Heading className="text-2xl">{s(d.heading)}</Heading>
      {s(d.welcomeText) && (
        <p className="mt-1 text-sm text-neutral-600">{s(d.welcomeText)}</p>
      )}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[210px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-neutral-200 p-4">
          <div className="flex flex-col items-center text-center">
            {s(d.avatar) ? (
              <Img src={s(d.avatar)} className="size-14 rounded-full object-cover" />
            ) : (
              <span className="flex size-14 items-center justify-center rounded-full bg-neutral-900 font-serif text-lg text-white">
                {name.charAt(0) || "?"}
              </span>
            )}
            <p className="mt-2 font-serif text-base text-neutral-900">{name}</p>
            <p className="text-xs text-neutral-500">{s(d.userEmail)}</p>
          </div>
          <div className="mt-4 space-y-1">
            {menu.map((m, i) => {
              const Icon = ACCOUNT_ICONS[s(m.icon)] ?? CircleUserIcon
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                    i === 0
                      ? "bg-neutral-900 font-medium text-white"
                      : "text-neutral-600"
                  )}
                >
                  <Icon className="size-3.5" />
                  {s(m.label)}
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="mb-4 font-serif text-lg text-neutral-900">{s(d.sectionHeading)}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabeledInput label="Full name" placeholder={name} />
            <LabeledInput label="Email" placeholder={s(d.userEmail)} />
            <LabeledInput label="Phone" placeholder="+1 (555) 000-0000" />
            <LabeledInput label="Preferred stylist" placeholder="Any" />
          </div>
          <div className="mt-5 w-32">
            <FullButton>{s(d.buttonLabel) || "Save changes"}</FullButton>
          </div>
        </div>
      </div>
    </div>
  )
}
