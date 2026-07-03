"use client"

import { createContext, useContext, useEffect } from "react"

import type { Workspace } from "@/lib/admin/types"
import { useWorkspaces } from "@/features/admin/workspaces/hooks/queries"
import { useActiveWorkspaceStore } from "@/features/admin/workspaces/store/active-workspace.store"

interface WorkspaceContextValue {
  workspaces: Workspace[]
  active: Workspace | null
  setActive: (workspace: Workspace) => void
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const activeId = useActiveWorkspaceStore((s) => s.activeId)
  const setActiveId = useActiveWorkspaceStore((s) => s.setActive)

  // Default the active workspace to the first available one, and recover if the
  // stored id no longer exists (e.g. after switching accounts).
  useEffect(() => {
    if (workspaces.length === 0) return
    const exists = activeId && workspaces.some((w) => w.id === activeId)
    if (!exists) setActiveId(workspaces[0].id)
  }, [workspaces, activeId, setActiveId])

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        active,
        setActive: (w) => setActiveId(w.id),
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return ctx
}
