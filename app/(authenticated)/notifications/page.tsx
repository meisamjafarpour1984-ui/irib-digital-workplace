'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  MessageSquare,
  Ticket,
  Settings,
  Loader2,
} from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'

const typeIcons: Record<string, typeof FileText> = {
  content: FileText,
  message: MessageSquare,
  ticket: Ticket,
  system: Settings,
}

const typeColors: Record<string, string> = {
  content: 'bg-brand/10 text-brand',
  message: 'bg-info/10 text-info',
  ticket: 'bg-warning/10 text-warning',
  system: 'bg-muted text-muted-foreground',
}

export default function NotificationsPage() {
  const t = useTranslations('notifications')
  const {
    notifications,
    stats,
    loading,
    markAsRead: markAsReadApi,
    markAllAsRead: markAllAsReadApi,
  } = useNotifications()
  const [filter, setFilter] = useState('all')
  const unreadCount = stats?.unread || 0

  const markAsRead = (id: string) => {
    markAsReadApi(id)
  }

  const markAllAsRead = () => {
    markAllAsReadApi()
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  if (loading) {
    return (
      <DashboardShell>
        <main className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </main>
          </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-heading-1 text-foreground">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('unreadCount', { count: unreadCount })}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  {t('markAllRead')}
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: t('filterAll') },
                { id: 'unread', label: t('filterUnread') },
                { id: 'message', label: t('filterMessages') },
                { id: 'ticket', label: t('filterTickets') },
                { id: 'content', label: t('filterContent') },
                { id: 'system', label: t('filterSystem') },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    filter === f.id
                      ? 'bg-brand text-white'
                      : 'bg-card border border-border text-muted-foreground hover:border-brand/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {filtered.map((notif) => {
                const Icon = typeIcons[notif.type] || Bell
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-brand/30 ${
                      !notif.read ? 'bg-brand/5' : ''
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${typeColors[notif.type]}`}
                    >
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'} text-foreground`}
                        >
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{notif.body}</p>
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        {notif.time}
                      </span>
                    </div>
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={t('markRead')}
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <Bell className="mx-auto size-12 text-muted-foreground/30" aria-hidden />
                  <p className="mt-4 text-body-lg text-muted-foreground">{t('empty')}</p>
                </div>
              )}
            </div>
          </div>
        </main>
        </DashboardShell>
  )
}
