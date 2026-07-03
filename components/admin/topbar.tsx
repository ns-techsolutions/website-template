"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store"
import { useAdminLogout } from "@/features/admin/auth/hooks/mutations"
import { NotificationsBell } from "@/features/admin/notifications/components/NotificationsBell"
import type { UserRole } from "@/features/auth/types/auth.dto"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { navItems } from "./nav-items"
import { MobileSidebar } from "./mobile-sidebar"

function usePageTitle() {
  const pathname = usePathname()
  const match = navItems
    .filter((item) => pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]
  if (match) return match.label
  const seg = pathname.split("/")[2] ?? "Admin"
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Up to two uppercased initials from a display name. */
function initials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")
}

/** Human-readable label for the panel role. */
function roleLabel(role?: UserRole): string {
  switch (role) {
    case "master":
      return "Master admin"
    case "tenant":
      return "Administrator"
    default:
      return "Member"
  }
}

export function Topbar() {
  const title = usePageTitle()
  const router = useRouter()
  const user = useAdminAuthStore((s) => s.user)
  const adminLogout = useAdminLogout()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-[color:var(--admin-sidebar)] px-4 lg:px-6">
      <MobileSidebar />

      <h1 className="font-heading text-lg font-semibold text-foreground lg:text-xl">
        {title}
      </h1>

      <div className="relative ml-auto hidden md:block">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search…"
          className="h-9 w-56 rounded-full bg-muted pl-9"
        />
      </div>

      <NotificationsBell className="ml-auto md:ml-0" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors hover:bg-accent"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-semibold text-foreground">
                {user?.name ?? "Account"}
              </span>
              <span className="text-xs text-muted-foreground">
                {roleLabel(user?.role)}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <span className="block text-sm font-semibold">
              {user?.name ?? "Account"}
            </span>
            {user?.email && (
              <span className="block text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">Profile &amp; account</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={async (e) => {
              e.preventDefault()
              await adminLogout()
              router.push("/admin/login")
            }}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
