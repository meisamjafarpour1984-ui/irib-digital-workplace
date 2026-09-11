/**
 * IRIB Digital Workplace Platform - Workspaces Management Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import {
  Boxes,
  Plus,
  Users,
  Calendar,
  Activity,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useWorkspaces } from '@/hooks/use-workspaces'

export default function WorkspacesManagementPage() {
  const [activeTab, setActiveTab] = useState('all')

  const { workspaces, stats, loading, error } = useWorkspaces()

  const tabs = [
    { id: 'all', label: 'همه کارتابل‌ها', count: workspaces?.length || 0 },
    {
      id: 'active',
      label: 'فعال',
      count: workspaces?.filter((w) => w.status === 'active').length || 0,
    },
    {
      id: 'archived',
      label: 'بایگانی شده',
      count: workspaces?.filter((w) => w.status === 'archived').length || 0,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    )
  }

  const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success',
    archived: 'bg-muted text-muted-foreground',
  }

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    archived: 'بایگانی شده',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت کارتابل‌ها</h1>
              <p className="text-sm text-muted-foreground">
                مدیریت کارتابل‌ها و فضاهای کاری سازمانی
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              کارتابل جدید
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Boxes className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل کارتابل‌ها</p>
                  <p className="text-lg font-bold text-foreground">۸</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <Activity className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">فعال</p>
                  <p className="text-lg font-bold text-foreground">۶</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Users className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل کاربران</p>
                  <p className="text-lg font-bold text-foreground">۷۰</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Calendar className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">فعالیت این هفته</p>
                  <p className="text-lg font-bold text-foreground">۱۴۵</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand text-brand'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Workspaces Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-brand">
                      <Boxes className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{workspace.name}</h3>
                      <p className="text-xs text-muted-foreground">{workspace.owner}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[workspace.status]}`}
                  >
                    {statusLabels[workspace.status]}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">اعضا:</span>
                    <span className="text-foreground">{workspace.members} کاربر</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ویجت‌ها:</span>
                    <span className="text-foreground">{workspace.widgets} مورد</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">آخرین فعالیت:</span>
                    <span className="text-foreground">{workspace.lastActivity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand/90">
                    <Eye className="size-4" />
                    مشاهده
                  </button>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Edit className="size-4" />
                  </button>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error">
                    <Trash2 className="size-4" />
                  </button>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MoreVertical className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">عملیات سریع</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <button className="flex items-center gap-3 rounded-lg bg-accent p-4 text-foreground transition-colors hover:bg-muted">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Plus className="size-4 text-brand" />
                </div>
                <div className="text-right">
                  <p className="font-medium">ایجاد کارتابل جدید</p>
                  <p className="text-xs text-muted-foreground">ایجاد فضای کاری جدید</p>
                </div>
              </button>
              <button className="flex items-center gap-3 rounded-lg bg-accent p-4 text-foreground transition-colors hover:bg-muted">
                <div className="rounded-lg bg-success/10 p-2">
                  <Users className="size-4 text-success" />
                </div>
                <div className="text-right">
                  <p className="font-medium">مدیریت کاربران</p>
                  <p className="text-xs text-muted-foreground">اضافه/حذف کاربران</p>
                </div>
              </button>
              <button className="flex items-center gap-3 rounded-lg bg-accent p-4 text-foreground transition-colors hover:bg-muted">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Settings className="size-4 text-warning" />
                </div>
                <div className="text-right">
                  <p className="font-medium">تنظیمات کارتابل</p>
                  <p className="text-xs text-muted-foreground">پیکربندی پیشرفته</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
