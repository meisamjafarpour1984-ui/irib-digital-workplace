/**
 * IRIB Digital Workplace Platform - Integration Management Dashboard
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
  Link2,
  Webhook,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useIntegrations } from '@/hooks/use-integrations'

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('connectors')
  const [searchQuery, setSearchQuery] = useState('')

  const { connectors, webhooks, syncHistory, stats, loading, error } = useIntegrations()

  const tabs = [
    { id: 'connectors', label: 'کانکتورهای Legacy', count: stats?.totalConnectors || 0 },
    { id: 'webhooks', label: 'Webhooks', count: stats?.totalWebhooks || 0 },
    { id: 'sync-history', label: 'تاریخچه Sync', count: stats?.totalSyncs || 0 },
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
    error: 'bg-error/10 text-error',
    paused: 'bg-warning/10 text-warning',
  }

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    error: 'خطا',
    paused: 'متوقف',
  }

  const typeStyles: Record<string, string> = {
    REST: 'bg-blue/10 text-blue',
    SOAP: 'bg-purple/10 text-purple',
    LDAP: 'bg-green/10 text-green',
    FTP: 'bg-brand/10 text-brand',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت یکپارچه‌سازی</h1>
              <p className="text-sm text-muted-foreground">مدیریت کانکتورهای Legacy و Webhooks</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              افزودن integration
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Link2 className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کانکتورها</p>
                  <p className="text-lg font-bold text-foreground">4</p>
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
                  <p className="text-lg font-bold text-foreground">3</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Webhook className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Webhooks</p>
                  <p className="text-lg font-bold text-foreground">7</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Clock className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Syncها امروز</p>
                  <p className="text-lg font-bold text-foreground">12</p>
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
                placeholder="جستجو در integrationها..."
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

          {/* Connectors Tab */}
          {activeTab === 'connectors' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نوع
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Base URL
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        آخرین Sync
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectors.map((connector) => (
                      <tr key={connector.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <Link2 className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{connector.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyles[connector.type]}`}
                          >
                            {connector.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {connector.baseUrl}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[connector.status]}`}
                          >
                            {statusLabels[connector.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {connector.lastSync}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Sync"
                            >
                              <Play className="size-4" />
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
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        URL
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        رویدادها
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        آخرین اجرا
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map((webhook) => (
                      <tr key={webhook.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <Webhook className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{webhook.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {webhook.url}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event) => (
                              <span
                                key={event}
                                className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground"
                              >
                                {event}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[webhook.status]}`}
                          >
                            {statusLabels[webhook.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {webhook.lastTriggered}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="توقف/فعال‌سازی"
                            >
                              {webhook.status === 'active' ? (
                                <Pause className="size-4" />
                              ) : (
                                <Play className="size-4" />
                              )}
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
          )}

          {/* Sync History Tab */}
          {activeTab === 'sync-history' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        کانکتور
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نوع Sync
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        زمان شروع
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        مدت زمان
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        رکوردها
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncHistory.map((sync) => (
                      <tr key={sync.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <Link2 className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{sync.connector}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              sync.type === 'full'
                                ? 'bg-purple/10 text-purple'
                                : 'bg-blue/10 text-blue'
                            }`}
                          >
                            {sync.type === 'full' ? 'کامل' : 'افزایشی'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {sync.startTime}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{sync.duration}</td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">
                          {sync.recordsProcessed.toLocaleString('fa-IR')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              sync.status === 'success'
                                ? 'bg-success/10 text-success'
                                : 'bg-error/10 text-error'
                            }`}
                          >
                            {sync.status === 'success' ? 'موفق' : 'خطا'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="مشاهده جزئیات"
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
          )}
        </main>
      </div>
    </div>
  )
}
