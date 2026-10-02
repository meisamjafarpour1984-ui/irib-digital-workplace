/**
 * IRIB Digital Workplace Platform - SMS Admin Dashboard
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
  LayoutDashboard,
  MessageSquare,
  Settings,
  BarChart3,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { useSms } from '@/hooks/use-sms'

export default function SmsAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { stats, campaigns, templates, queue } = useSms()

  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: LayoutDashboard },
    { id: 'campaigns', label: 'کمپین‌ها', icon: MessageSquare },
    { id: 'templates', label: 'قالب‌ها', icon: Settings },
    { id: 'analytics', label: 'تحلیل و آمار', icon: BarChart3 },
    { id: 'queue', label: 'صف ارسال', icon: Clock },
  ]

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت پیامک</h1>
              <p className="text-sm text-muted-foreground">
                مدیریت سامانه پیامک و کمپین‌های اطلاع‌رسانی
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Send className="size-4" />
              ارسال پیامک جدید
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand text-brand'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'campaigns' && <CampaignsTab campaigns={campaigns} />}
          {activeTab === 'templates' && <TemplatesTab templates={templates} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'queue' && <QueueTab queue={queue} />}
        </main>
  )
}

function OverviewTab({ stats }: { stats: ReturnType<typeof useSms>['stats'] }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statItems = [
    {
      label: 'پیامک‌های ارسال شده',
      value: stats.totalSent.toLocaleString('fa-IR'),
      change: '',
      icon: Send,
      color: 'text-brand',
    },
    {
      label: 'نرخ تحویل موفق',
      value: `${stats.successRate.toFixed(1)}%`,
      change: '',
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'نرخ شکست',
      value: `${(100 - stats.successRate).toFixed(1)}%`,
      change: '',
      icon: XCircle,
      color: 'text-error',
    },
    {
      label: 'کمپین‌ها',
      value: stats.totalCampaigns.toLocaleString('fa-IR'),
      change: '',
      icon: MessageSquare,
      color: 'text-warning',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.change && (
                    <p
                      className={`mt-1 text-xs ${stat.change.startsWith('+') ? 'text-success' : 'text-error'}`}
                    >
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`rounded-lg bg-accent p-3 ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">فعالیت‌های اخیر</h3>
        <div className="space-y-4">
          {[
            { action: 'کمپین اطلاع‌رسانی استخدامی ارسال شد', time: '۱۰:۳۰', status: 'success' },
            { action: 'کمپین یادآوری جلسه در حال ارسال', time: '۰۹:۴۵', status: 'pending' },
            { action: 'پیامک گروهی به واحد IT ارسال شد', time: '۰۸:۲۰', status: 'success' },
            { action: 'خطا در ارسال کمپین آموزشی', time: 'دیروز', status: 'error' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                {activity.status === 'success' && <CheckCircle className="size-4 text-success" />}
                {activity.status === 'pending' && <Clock className="size-4 text-warning" />}
                {activity.status === 'error' && <XCircle className="size-4 text-error" />}
                <span className="text-sm text-foreground">{activity.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CampaignsTab({ campaigns }: { campaigns: ReturnType<typeof useSms>['campaigns'] }) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-center text-muted-foreground">هیچ کمپینی یافت نشد</p>
      </div>
    )
  }

  const statusStyles: Record<string, string> = {
    completed: 'bg-success/10 text-success',
    sending: 'bg-warning/10 text-warning',
    scheduled: 'bg-info/10 text-info',
    failed: 'bg-error/10 text-error',
  }

  const statusLabels: Record<string, string> = {
    completed: 'تکمیل شده',
    sending: 'در حال ارسال',
    scheduled: 'برنامه‌ریزی شده',
    failed: 'ناموفق',
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">کمپین‌های پیامکی</h3>
          <button className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand/90">
            کمپین جدید
          </button>
        </div>
        <div className="divide-y divide-border">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                  <MessageSquare className="size-5 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ارسال: {campaign.sent} | تحویل: {campaign.delivered} | شکست: {campaign.failed}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[campaign.status]}`}
                >
                  {statusLabels[campaign.status]}
                </span>
                <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Settings className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TemplatesTab({ templates }: { templates: ReturnType<typeof useSms>['templates'] }) {
  if (!templates || templates.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-center text-muted-foreground">هیچ قالبی یافت نشد</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">قالب‌های پیامک</h3>
          <button className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand/90">
            قالب جدید
          </button>
        </div>
        <div className="divide-y divide-border">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                  <Settings className="size-5 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    متغیرها: {template.variables.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Settings className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تحلیل و آمار پیامک</h3>
        <div className="space-y-4">
          <div className="h-64 rounded-lg bg-accent" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">بیشترین ارسال‌کننده</p>
              <p className="mt-2 text-lg font-bold text-foreground">واحد استخدام</p>
              <p className="text-xs text-muted-foreground">۳,۴۵۶ پیامک</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">بهترین زمان ارسال</p>
              <p className="mt-2 text-lg font-bold text-foreground">۱۰:۰۰ صبح</p>
              <p className="text-xs text-muted-foreground">نرخ تحویل ۹۵٪</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">محبوب‌ترین قالب</p>
              <p className="mt-2 text-lg font-bold text-foreground">کد تایید ورود</p>
              <p className="text-xs text-muted-foreground">۵,۶۷۸ ارسال</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QueueTab({ queue }: { queue: ReturnType<typeof useSms>['queue'] }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-center text-muted-foreground">صف ارسال خالی است</p>
      </div>
    )
  }

  const queueStats = {
    pending: queue.filter((q) => q.status === 'pending').length,
    processing: queue.filter((q) => q.status === 'sent').length,
    completed: queue.filter((q) => q.status === 'sent').length,
    failed: queue.filter((q) => q.status === 'failed').length,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2">
              <Clock className="size-4 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">در انتظار</p>
              <p className="text-lg font-bold text-foreground">{queueStats.pending}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-info/10 p-2">
              <Send className="size-4 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">در حال پردازش</p>
              <p className="text-lg font-bold text-foreground">{queueStats.processing}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle className="size-4 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تکمیل شده</p>
              <p className="text-lg font-bold text-foreground">{queueStats.completed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-error/10 p-2">
              <XCircle className="size-4 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ناموفق</p>
              <p className="text-lg font-bold text-foreground">{queueStats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">مدیریت صف ارسال</h3>
          <div className="flex gap-2">
            <button className="rounded-lg bg-warning px-3 py-1.5 text-sm text-white transition-colors hover:bg-warning/90">
              توقف موقت
            </button>
            <button className="rounded-lg bg-success px-3 py-1.5 text-sm text-white transition-colors hover:bg-success/90">
              از سرگیری
            </button>
            <button className="rounded-lg bg-error px-3 py-1.5 text-sm text-white transition-colors hover:bg-error/90">
              پاکسازی
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: 1, recipient: '09123456789', status: 'pending', priority: 'high' },
            { id: 2, recipient: '09223456789', status: 'processing', priority: 'normal' },
            { id: 3, recipient: '09323456789', status: 'failed', priority: 'low' },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-accent p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-1.5 ${
                    item.status === 'pending'
                      ? 'bg-warning/20 text-warning'
                      : item.status === 'processing'
                        ? 'bg-info/20 text-info'
                        : 'bg-error/20 text-error'
                  }`}
                >
                  {item.status === 'pending' && <Clock className="size-3" />}
                  {item.status === 'processing' && <Send className="size-3" />}
                  {item.status === 'failed' && <XCircle className="size-3" />}
                </div>
                <span className="text-sm text-foreground">{item.recipient}</span>
              </div>
              <span
                className={`text-xs font-medium ${
                  item.priority === 'high'
                    ? 'text-error'
                    : item.priority === 'normal'
                      ? 'text-warning'
                      : 'text-muted-foreground'
                }`}
              >
                {item.priority === 'high' && 'اولویت بالا'}
                {item.priority === 'normal' && 'اولویت عادی'}
                {item.priority === 'low' && 'اولویت پایین'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
