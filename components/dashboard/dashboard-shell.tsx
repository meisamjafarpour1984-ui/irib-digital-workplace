import type { ReactNode } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { MobileNav } from '@/components/layout/mobile-nav'

type DashboardShellProps = {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-20 lg:pb-0">{children}</div>
      </div>
      <MobileNav />
    </div>
  )
}
