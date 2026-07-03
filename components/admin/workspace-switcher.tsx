"use client"

import Link from "next/link"
import {
  Building2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  PlusIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store"
import { useWorkspace } from "./workspace-context"

function Mark({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-heading font-semibold text-white",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </span>
  )
}

export function WorkspaceSwitcher() {
  const { workspaces, active, setActive, isLoading } = useWorkspace()
  const isMaster = useAdminAuthStore((s) => s.user?.role) === "master"

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-2.5 rounded-lg p-1.5">
        <span className="size-9 shrink-0 animate-pulse rounded-md bg-muted" />
        <span className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  // Master with no salons registered yet — nothing to switch between.
  if (!active) {
    return (
      <div className="flex w-full items-center gap-2.5 rounded-lg p-1.5">
        <Mark name="Platform" color="#2d3b64" className="size-9 text-base" />
        <span className="flex min-w-0 flex-1 flex-col leading-none">
          <span className="truncate font-heading text-sm font-semibold text-foreground">
            Platform Console
          </span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">
            No salons yet
          </span>
        </span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-accent"
        >
          <Mark name={active.name} color={active.accent} className="size-9 text-base" />
          <span className="flex min-w-0 flex-1 flex-col leading-none">
            <span className="truncate font-heading text-sm font-semibold text-foreground">
              {active.name}
            </span>
            <span className="mt-0.5 text-[11px] capitalize text-muted-foreground">
              {active.plan} plan
            </span>
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => setActive(w)}
            className="gap-2.5"
          >
            <Mark name={w.name} color={w.accent} className="size-6 text-xs" />
            <span className="min-w-0 flex-1 truncate">{w.name}</span>
            {w.id === active.id && <CheckIcon className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        {isMaster && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/workspaces">
                <Building2Icon />
                Manage workspaces
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/workspaces">
                <PlusIcon />
                Add workspace
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
