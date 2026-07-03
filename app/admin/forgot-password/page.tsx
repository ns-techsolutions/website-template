import { headers } from "next/headers"

import { ForgotPasswordView } from "@/features/admin/login/components"
import { getPrimarySettings } from "@/lib/cms/public"
import { isPlatformHost, platformBrandName } from "@/lib/db/tenant"

export default async function AdminForgotPasswordPage() {
  const h = await headers()
  const host = h.get("x-tenant-host") ?? h.get("x-forwarded-host") ?? h.get("host")

  if (isPlatformHost(host)) {
    return <ForgotPasswordView brandName={platformBrandName()} isPlatform />
  }

  const { appearance } = await getPrimarySettings()
  return <ForgotPasswordView brandName={appearance.brandName || "Admin"} />
}
