import { SignUpForm } from "@/features/auth/components/SignUpForm"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function SignupBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <SignUpForm
      eyebrow={s(d.eyebrow)}
      heading={s(d.heading)}
      subtitle={s(d.subtitle)}
      image={s(d.image)}
      buttonLabel={s(d.buttonLabel)}
      termsText={s(d.termsText)}
      footerText={s(d.footerText)}
      footerLinkLabel={s(d.footerLinkLabel)}
      footerLinkUrl={s(d.footerLinkUrl)}
    />
  )
}
