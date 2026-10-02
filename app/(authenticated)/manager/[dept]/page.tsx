'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { VisitsChart } from '@/components/dashboard/visits-chart'
import { TrafficDonut } from '@/components/dashboard/traffic-donut'
import { ActivityList } from '@/components/dashboard/activity-list'
import { TicketsList } from '@/components/dashboard/tickets-list'

export default function ManagerDashboardPage() {
  return (
    <DashboardShell>
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
        </DashboardShell>
  )
}
