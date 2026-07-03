"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store"
import { refreshScope } from "@/lib/api/client"

/**
 * Client-side gate for the admin panel. Rehydrates the persisted admin auth
 * store (which uses `skipHydration`), then silently renews the access token from
 * the admin refresh cookie. Only `master`/`tenant` users see the panel —
 * everyone else is bounced to the login page. Server-side `requireStaff` on the
 * CMS APIs remains the real authorization boundary.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAdminAuthStore((s) => s.user)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      await Promise.resolve(useAdminAuthStore.persist.rehydrate())
      await refreshScope("admin")
      if (active) setHydrated(true)
    })()
    return () => {
      active = false
    }
  }, [])

  const allowed = !!user && user.role !== "customer"

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/admin/login")
  }, [hydrated, allowed, router])

  if (!hydrated || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
