'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Bell, Check, CheckCheck, FileText, MessageSquare, Ticket, Settings } from 'lucide-react'

interface Notification {
  id: string
  type: 'content' | 'message' | 'ticket' | 'system'
  title: string
  body: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'پیام جدید از رضا کریمی',
    body: 'دسترسی شما به آرشیو تصویری فعال شد.',
    time: '۵ دقیقه پیش',
    read: false,
  },
  {
    id: '2',
    type: 'ticket',
    title: 'تیکت #۱۲۳۴ بسته شد',
    body: 'درخواست شما با موفقیت انجام شد.',
    time: '۱۵ دقیقه پیش',
    read: false,
  },
  {
    id: '3',
    type: 'content',
    title: 'خبر جدید منتشر شد',
    body: 'برگزاری نشست هم‌اندیشی مدیران',
    time: '۱ ساعت پیش',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'به‌روزرسانی سیستم',
    body: 'نسخه جدید پرتال فعال شد.',
    time: '۳ ساعت پیش',
    read: true,
  },
  {
    id: '5',
    type: 'message',
    title: 'پاسخ به فرم نظرسنجی',
    body: 'نتایج نظرسنجی رضایت کارکنان منتشر شد.',
    time: '۵ ساعت پیش',
    read: true,
  },
  {
    id: '6',
    type: 'ticket',
    title: 'تیکت جدید ثبت شد',
    body: 'تیکت پشتیبانی شما با شماره #۱۲۳۵ ثبت شد.',
    time: '۱ روز پیش',
    read: true,
  },
]

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
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState('all')
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-heading-1 text-foreground">اعلان‌ها</h1>
                <p className="text-sm text-muted-foreground">{unreadCount} اعلان خوانده نشده</p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  همه خوانده شد
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'همه' },
                { id: 'unread', label: 'خوانده نشده' },
                { id: 'message', label: 'پیام‌ها' },
                { id: 'ticket', label: 'تیکت‌ها' },
                { id: 'content', label: 'محتوا' },
                { id: 'system', label: 'سیستم' },
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
                        aria-label="خوانده شد"
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
                  <p className="mt-4 text-body-lg text-muted-foreground">اعلانی وجود ندارد</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
