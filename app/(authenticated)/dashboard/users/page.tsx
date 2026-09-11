/**
 * IRIB Digital Workplace Platform - Users Management Dashboard
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
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useUsers } from '@/hooks/use-users'

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { users, loading, error } = useUsers()

  const tabs = [
    { id: 'all', label: 'همه کاربران', count: users?.length || 0 },
    { id: 'active', label: 'فعال', count: users?.filter((u) => u.status === 'active').length || 0 },
    {
      id: 'pending',
      label: 'در انتظار',
      count: users?.filter((u) => u.status === 'pending').length || 0,
    },
    {
      id: 'disabled',
      label: 'غیرفعال',
      count: users?.filter((u) => u.status === 'disabled').length || 0,
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
    pending: 'bg-warning/10 text-warning',
    disabled: 'bg-error/10 text-error',
  }

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    pending: 'در انتظار',
    disabled: 'غیرفعال',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت کاربران</h1>
              <p className="text-sm text-muted-foreground">مدیریت کاربران و دسترسی‌ها</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <UserPlus className="size-4" />
              افزودن کاربر
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Users className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل کاربران</p>
                  <p className="text-lg font-bold text-foreground">۲۰۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">فعال</p>
                  <p className="text-lg font-bold text-foreground">۱۹۵</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Shield className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">در انتظار</p>
                  <p className="text-lg font-bold text-foreground">۵</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-error/10 p-2">
                  <XCircle className="size-5 text-error" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">غیرفعال</p>
                  <p className="text-lg font-bold text-foreground">۳</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در کاربران..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
              <Filter className="size-4" />
              فیلتر
            </button>
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

          {/* Users Table */}
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      کد پرسنلی
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      نام
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      ایمیل
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      موبایل
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      واحد
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      نقش‌ها
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      وضعیت
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      آخرین ورود
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <code className="rounded bg-accent px-2 py-1 text-sm text-foreground">
                          {user.personnelCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <span className="text-sm font-bold">{user.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-foreground">{user.nameFa}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.mobile}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{user.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[user.status]}`}
                        >
                          {statusLabels[user.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.lastLogin}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="ویرایش"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="بیشتر"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
