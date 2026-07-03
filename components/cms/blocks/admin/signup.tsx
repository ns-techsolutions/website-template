import type { AdminBlockProps, AnyData } from "./types"
import { AuthShell, Eyebrow, FullButton, Heading, LabeledInput, s } from "./_shared"

export function SignupBlock({ block }: AdminBlockProps) {
  const d = block.data as AnyData
  return (
    <AuthShell image={s(d.image)}>
      <Eyebrow>{s(d.eyebrow)}</Eyebrow>
      <Heading className="text-2xl">{s(d.heading)}</Heading>
      {s(d.subtitle) && (
        <p className="mt-2 text-sm text-neutral-600">{s(d.subtitle)}</p>
      )}
      <div className="mt-5 space-y-3">
        <LabeledInput label="Full name" placeholder="Jane Doe" />
        <LabeledInput label="Email address" placeholder="you@example.com" />
        <LabeledInput label="Phone" placeholder="+1 555 000 0000" />
        <LabeledInput label="Password" placeholder="••••••••" />
        <div className="pt-1">
          <FullButton>{s(d.buttonLabel) || "Create Account"}</FullButton>
        </div>
        {s(d.termsText) && (
          <p className="text-center text-[11px] leading-relaxed text-neutral-500">
            {s(d.termsText)}
          </p>
        )}
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
