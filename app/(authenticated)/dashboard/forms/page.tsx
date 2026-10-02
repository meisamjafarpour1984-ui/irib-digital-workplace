/**
 * IRIB Digital Workplace Platform - Forms Management Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { ClipboardList, Plus, Search, Filter } from 'lucide-react'

export default function FormsManagementPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'all', label: 'همه فرم‌ها', count: 12 },
    { id: 'active', label: 'فعال', count: 8 },
    { id: 'draft', label: 'پیش‌نویس', count: 3 },
    { id: 'archived', label: 'بایگانی شده', count: 1 },
  ]

  const forms = [
    {
      id: 1,
      name: 'فرم نظرسنجی رضایت کارمندان',
      submissions: 145,
      status: 'active',
      createdAt: '۱۴۰۳/۰۵/۲۰',
    },
    {
      id: 2,
      name: 'فرم درخواست مرخصی',
      submissions: 89,
      status: 'active',
      createdAt: '۱۴۰۳/۰۵/۱۵',
    },
    {
      id: 3,
      name: 'فرم گزارش هفتگی',
      submissions: 234,
      status: 'active',
      createdAt: '۱۴۰۳/۰۵/۱۰',
    },
  ]

  const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success',
    draft: 'bg-warning/10 text-warning',
    archived: 'bg-muted text-muted-foreground',
  }

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    draft: 'پیش‌نویس',
    archived: 'بایگانی شده',
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت فرم‌ها</h1>
              <p className="text-sm text-muted-foreground">ایجاد و مدیریت فرم‌های تعاملی</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              فرم جدید
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در فرم‌ها..."
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

          {/* Forms Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div key={form.id} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <ClipboardList className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{form.name}</h3>
                      <p className="text-xs text-muted-foreground">{form.submissions} ارسال</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[form.status]}`}
                  >
                    {statusLabels[form.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ایجاد شده: {form.createdAt}</span>
                  <button className="text-brand hover:underline">مشاهده ارسال‌ها</button>
                </div>
              </div>
            ))}
          </div>
        </main>
  )
}
