/**
 * IRIB Digital Workplace Platform - Announcements Management Dashboard
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
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  CheckCircle,
  Clock,
  Send,
  Bell,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useAnnouncements } from '@/hooks/use-announcements'
import { useTranslations } from 'next-intl'

export default function AnnouncementsPage() {
  const t = useTranslations('announcements')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { announcements, stats, loading } = useAnnouncements()

  const tabs = [
    { id: 'all', label: t('tabs.all'), count: stats?.totalAnnouncements || 0 },
    { id: 'published', label: t('tabs.published'), count: stats?.published || 0 },
    { id: 'draft', label: t('tabs.draft'), count: stats?.draft || 0 },
    { id: 'scheduled', label: t('tabs.scheduled'), count: stats?.scheduled || 0 },
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
    published: 'bg-success/10 text-success',
    draft: 'bg-gray/10 text-gray-700',
    scheduled: 'bg-warning/10 text-warning',
  }

  const statusLabels: Record<string, string> = {
    published: t('status.published'),
    draft: t('status.draft'),
    scheduled: t('status.scheduled'),
  }

  const priorityStyles: Record<string, string> = {
    high: 'bg-error/10 text-error',
    normal: 'bg-info/10 text-info',
    low: 'bg-muted text-muted-foreground',
  }

  const priorityLabels: Record<string, string> = {
    high: t('priority.high'),
    normal: t('priority.normal'),
    low: t('priority.low'),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              {t('create')}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Megaphone className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.total')}</p>
                  <p className="text-lg font-bold text-foreground">۴۵</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.published')}</p>
                  <p className="text-lg font-bold text-foreground">۳۸</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Clock className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.scheduled')}</p>
                  <p className="text-lg font-bold text-foreground">۲</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Bell className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.totalViews')}</p>
                  <p className="text-lg font-bold text-foreground">۱,۲۳۴</p>
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
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
              <Filter className="size-4" />
              {t('filter')}
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

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Megaphone className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                      <p className="text-xs text-muted-foreground">{announcement.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[announcement.status]}`}
                    >
                      {statusLabels[announcement.status]}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[announcement.priority]}`}
                    >
                      {priorityLabels[announcement.priority]}
                    </span>
                  </div>
                </div>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {announcement.publishedAt && (
                      <span>
                        {t('labels.publishedAt')}: {announcement.publishedAt}
                      </span>
                    )}
                    {announcement.scheduledAt && (
                      <span>
                        {t('labels.scheduledAt')}: {announcement.scheduledAt}
                      </span>
                    )}
                    <span>
                      {t('labels.views')}: {announcement.views}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {announcement.status === 'draft' && (
                      <button
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={t('actions.publish')}
                      >
                        <Send className="size-4" />
                      </button>
                    )}
                    <button
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={t('actions.edit')}
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={t('actions.more')}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
