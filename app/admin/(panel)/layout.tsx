import { AdminGuard } from "@/components/admin/admin-guard"
import { Sidebar } from "@/components/admin/sidebar"
import { Topbar } from "@/components/admin/topbar"
import { WorkspaceProvider } from "@/components/admin/workspace-context"

export default function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminGuard>
      <WorkspaceProvider>
        <div className="admin-canvas flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 p-4 lg:p-6">
              <div className="mx-auto w-full max-w-[1400px] space-y-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </AdminGuard>
  )
}
