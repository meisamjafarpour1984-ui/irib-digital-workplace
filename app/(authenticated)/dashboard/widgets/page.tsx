/**
 * IRIB Digital Workplace Platform - Widgets Management Dashboard
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
  Blocks,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  CheckCircle,
  XCircle,
  LayoutGrid,
  Settings,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useWidgets } from '@/hooks/use-widgets'

export default function WidgetsPage() {
  const [activeTab, setActiveTab] = useState('widgets')
  const [searchQuery, setSearchQuery] = useState('')

  const { widgets, stats, loading } = useWidgets()

  const tabs = [
    { id: 'widgets', label: 'ویجت‌ها', count: stats?.totalWidgets || 0 },
    { id: 'layouts', label: 'Layoutها', count: stats?.totalLayouts || 0 },
    { id: 'categories', label: 'دسته‌بندی‌ها', count: stats?.categories || 0 },
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

  const categoryStyles: Record<string, string> = {
    Hero: 'bg-brand/10 text-brand',
    Navigation: 'bg-purple/10 text-purple',
    Auth: 'bg-indigo/10 text-indigo',
    Content: 'bg-blue/10 text-blue',
    Media: 'bg-cyan/10 text-cyan',
    Services: 'bg-emerald/10 text-emerald',
    Knowledge: 'bg-amber/10 text-amber',
    Utility: 'bg-green/10 text-green',
    Admin: 'bg-rose/10 text-rose',
    Support: 'bg-orange/10 text-orange',
    Department: 'bg-teal/10 text-teal',
  }

  const categoryLabels: Record<string, string> = {
    Hero: 'هیرو',
    Navigation: 'ناوبری',
    Auth: 'احراز هویت',
    Content: 'محتوا',
    Media: 'مدیا',
    Services: 'خدمات',
    Knowledge: 'دانش',
    Utility: 'کاربردی',
    Admin: 'مدیریت',
    Support: 'پشتیبانی',
    Department: 'دپارتمان',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت ویجت‌ها</h1>
              <p className="text-sm text-muted-foreground">مدیریت ویجت‌ها و layoutهای صفحه اصلی</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              افزودن ویجت
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Blocks className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل ویجت‌ها</p>
                  <p className="text-lg font-bold text-foreground">{stats?.totalWidgets || 0}</p>
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
                  <p className="text-lg font-bold text-foreground">{stats?.activeWidgets || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <LayoutGrid className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Layoutها</p>
                  <p className="text-lg font-bold text-foreground">{stats?.totalLayouts || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Settings className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">دسته‌بندی‌ها</p>
                  <p className="text-lg font-bold text-foreground">{stats?.categories || 0}</p>
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
                placeholder="جستجو در ویجت‌ها..."
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

          {/* Widgets Tab */}
          {activeTab === 'widgets' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {widgets
                .filter((w) => {
                  return (
                    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    w.key.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                })
                .map((widget) => {
                  const name = widget.name
                  const defaultSize = (widget.defaultSize as { cols: number; rows: number }) || {
                    cols: 4,
                    rows: 3,
                  }
                  return (
                    <div
                      key={widget.key}
                      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                          <Blocks className="size-6" />
                        </div>
                        {widget.ssr !== false ? (
                          <CheckCircle className="size-5 text-success" />
                        ) : (
                          <XCircle className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="mb-1 font-semibold text-foreground">{name}</h3>
                      <code className="mb-3 block text-xs text-muted-foreground">{widget.key}</code>
                      <p className="mb-4 text-sm text-muted-foreground">
                        مسیر: {widget.componentPath}
                      </p>
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className={`rounded-full px-2 py-0.5 ${categoryStyles[widget.category] || 'bg-gray/10 text-gray'}`}
                          >
                            {categoryLabels[widget.category] || widget.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            اندازه: {defaultSize.cols}x{defaultSize.rows}
                          </span>
                          {widget.resizable && <span>• قابل تغییر اندازه</span>}
                          {widget.ssr && <span>• SSR</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                          <Edit className="size-4" />
                          ویرایش
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Layouts Tab Placeholder */}
          {activeTab === 'layouts' && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <LayoutGrid className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">مدیریت Layoutها</h2>
              <p className="mt-2 text-sm text-muted-foreground">این بخش در حال توسعه است.</p>
            </div>
          )}

          {/* Categories Tab Placeholder */}
          {activeTab === 'categories' && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Settings className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">مدیریت دسته‌بندی‌ها</h2>
              <p className="mt-2 text-sm text-muted-foreground">این بخش در حال توسعه است.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
