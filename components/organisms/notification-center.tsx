'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Check, CheckCheck, FileText, MessageSquare, Ticket, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'content' | 'message' | 'ticket' | 'system'
  title: string
  body: string
  time: string
  read: boolean
  href?: string
}

const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'پیام جدید از رضا کریمی',
    body: 'دسترسی شما فعال شد.',
    time: '۵ دقیقه پیش',
    read: false,
  },
  {
    id: 'n2',
    type: 'ticket',
    title: 'تیکت #۱۲۳۴ بسته شد',
    body: 'درخواست شما با موفقیت انجام شد.',
    time: '۱۵ دقیقه پیش',
    read: false,
  },
  {
    id: 'n3',
    type: 'content',
    title: 'خبر جدید منتشر شد',
    body: 'برگزاری نشست هم‌اندیشی مدیران',
    time: '۱ ساعت پیش',
    read: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'به‌روزرسانی سیستم',
    body: 'نسخه جدید درگاه فعال شد.',
    time: '۳ ساعت پیش',
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

export function NotificationCenter() {
  const t = useTranslations('notifications')
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState(notifications)
  const unreadCount = items.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t('title')}
        aria-expanded={isOpen}
      >
        <Bell className="size-4.5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-x-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-card shadow-lg sm:left-0 sm:right-auto sm:w-96">
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  {t('markAllAsRead')}
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.map((notif) => {
                const Icon = typeIcons[notif.type] || Bell
                return (
                  <li
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 border-b border-border p-3 transition-colors hover:bg-muted/50',
                      !notif.read && 'bg-brand/5'
                    )}
                  >
                    <div
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${typeColors[notif.type]}`}
                    >
                      <Icon className="size-4" aria-hidden />
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
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {notif.body}
                      </p>
                      <span className="mt-1 text-[10px] text-muted-foreground">{notif.time}</span>
                    </div>
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={t('markAsRead')}
                      >
                        <Check className="size-3" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            {items.length === 0 && (
              <div className="py-8 text-center">
                <Bell className="mx-auto size-8 text-muted-foreground/30" aria-hidden />
                <p className="mt-2 text-sm text-muted-foreground">{t('noNotifications')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
