import type { AdminBlockProps, AnyData } from "./types"
import { AuthShell, Eyebrow, FullButton, Heading, LabeledInput, s } from "./_shared"

export function SigninBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <AuthShell image={s(d.image)}>
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="text-2xl">{s(d.heading)}</Heading>
      {s(d.subtitle) && (
        <p className="mt-2 text-sm text-neutral-600">{s(d.subtitle)}</p>
      )}
      <div className="mt-5 space-y-3">
        <LabeledInput label="Email address" placeholder="you@example.com" />
        <LabeledInput label="Password" placeholder="••••••••" />
        {s(d.forgotText) && (
          <p className="text-right text-[11px] font-medium text-neutral-500">
            {s(d.forgotText)}
          </p>
        )}
        <div className="pt-1">
          <FullButton>{s(d.buttonLabel) || "Sign In"}</FullButton>
        </div>
      </div>
      {s(d.footerText) && (
        <p className="mt-4 text-center text-xs text-neutral-500">
          {s(d.footerText)}{" "}
          <span className="font-semibold text-neutral-900">{s(d.footerLinkLabel)}</span>
        </p>
      )}
    </AuthShell>
  )
}
