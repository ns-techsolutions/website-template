"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store"
import { useAdminLogout } from "@/features/admin/auth/hooks/mutations"
import { navSections } from "./nav-items"
import { useWorkspace } from "./workspace-context"
import { WorkspaceSwitcher } from "./workspace-switcher"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAdminAuthStore((s) => s.user)
  const adminLogout = useAdminLogout()
  const { workspaces, isLoading } = useWorkspace()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  // Master with no salons registered yet — there's nothing to manage except
  // creating the first salon, so only show that section.
  const isMaster = user?.role === "master"
  const onlyWorkspaces = isMaster && !isLoading && workspaces.length === 0
  const sections = (
    onlyWorkspaces
      ? navSections.filter((s) => s.title === "Platform")
      : navSections
  )
    // Workspace management is a platform concern — hide master-only items
    // (e.g. Workspaces) from tenant admins.
    .map((s) => ({ ...s, items: s.items.filter((i) => isMaster || !i.masterOnly) }))
    .filter((s) => s.items.length > 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-3">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 hide-scrollbar">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase">
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      prefetch={false}
                      className={cn(
                        "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-[color:var(--admin-nav-idle)] hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={async () => {
            onNavigate?.()
            await adminLogout()
            router.push("/admin/login")
          }}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOutIcon className="size-[18px]" />
          Log out
        </button>
        <p className="mt-2 px-3 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          © {new Date().getFullYear()} Reine Salon · v1.0.0
        </p>
      </div>
    </div>
  )
}
