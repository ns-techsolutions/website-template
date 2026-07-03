import { SignInForm } from "@/features/auth/components/SignInForm"
import type { PublicBlockProps, AnyData } from "./types"
import { s } from "./_shared"

export function SigninBlock({ block }: PublicBlockProps) {
  const d = block.data as AnyData
  return (
    <SignInForm
      eyebrow={s(d.eyebrow)}
      heading={s(d.heading)}
      subtitle={s(d.subtitle)}
      image={s(d.image)}
      buttonLabel={s(d.buttonLabel)}
      forgotText={s(d.forgotText)}
      footerText={s(d.footerText)}
      footerLinkLabel={s(d.footerLinkLabel)}
      footerLinkUrl={s(d.footerLinkUrl)}
    />
  )
}
