import { headers } from "next/headers"

import { ResetPasswordView } from "@/features/admin/login/components"
import { getPrimarySettings } from "@/lib/cms/public"
import { isPlatformHost, platformBrandName } from "@/lib/db/tenant"

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const h = await headers()
  const host = h.get("x-tenant-host") ?? h.get("x-forwarded-host") ?? h.get("host")

  if (isPlatformHost(host)) {
    return (
      <ResetPasswordView
        brandName={platformBrandName()}
        isPlatform
        token={token ?? ""}
      />
    )
  }

  const { appearance } = await getPrimarySettings()
  return (
    <ResetPasswordView
      brandName={appearance.brandName || "Admin"}
      token={token ?? ""}
    />
  )
}
