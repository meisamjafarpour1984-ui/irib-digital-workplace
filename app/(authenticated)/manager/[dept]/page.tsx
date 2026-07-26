'use client'

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { VisitsChart } from '@/components/dashboard/visits-chart'
import { TrafficDonut } from '@/components/dashboard/traffic-donut'
import { ActivityList } from '@/components/dashboard/activity-list'
import { TicketsList } from '@/components/dashboard/tickets-list'

export default function ManagerDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <KpiCards />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VisitsChart />
            </div>
            <TrafficDonut />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityList />
            <TicketsList />
          </div>
        </main>
      </div>
    </div>
  )
}
