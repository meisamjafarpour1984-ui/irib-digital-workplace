/**
 * IRIB Digital Workplace Platform - Dashboard Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { VisitsChart } from '@/components/dashboard/visits-chart'
import { TrafficDonut } from '@/components/dashboard/traffic-donut'
import { ActivityList } from '@/components/dashboard/activity-list'
import { TicketsList } from '@/components/dashboard/tickets-list'
import NotificationsCenterWidget from '@/app/components/widgets/notifications-center'
import TaskManagementWidget from '@/app/components/widgets/task-management'
import ApprovalWorkflowWidget from '@/app/components/widgets/approval-workflow'
import ReportingModuleWidget from '@/app/components/widgets/reporting-module'

export const metadata: Metadata = {
  title: 'داشبورد مدیریتی | درگاه دیجیتال کارکنان',
  description: 'داشبورد مدیریت محتوا و سامانه‌های مرکز صدا و سیمای آذربایجان شرقی',
}

export default function DashboardPage() {
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
            <NotificationsCenterWidget />
            <TaskManagementWidget />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ApprovalWorkflowWidget />
            <ReportingModuleWidget />
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
