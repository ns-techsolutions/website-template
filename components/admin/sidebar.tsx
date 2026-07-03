import { SidebarNav } from "./sidebar-nav"

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-border bg-[color:var(--admin-sidebar)] lg:block">
      <SidebarNav />
    </aside>
  )
}
