/**
 * IRIB Digital Workplace Platform - Real-time Notifications Center Widget
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Bell,
  X,
  Check,
  MoreVertical,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'

export default function NotificationsCenterWidget() {
  const t = useTranslations('notifications')
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'سیستم به‌روزرسانی شد',
      message: 'نسخه جدید سیستم با قابلیت‌های جدید منتشر شد',
      time: '۵ دقیقه پیش',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'رمز عبور منقضی می‌شود',
      message: 'رمز عبور شما تا ۳ روز دیگر منقضی می‌شود',
      time: '۱ ساعت پیش',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'مطلب شما منتشر شد',
      message: 'مطلب "گزارش ماهانه" با موفقیت منتشر شد',
      time: '۲ ساعت پیش',
      read: true,
    },
    {
      id: 4,
      type: 'message',
      title: 'پیام جدید از مدیر',
      message: 'لطفاً گزارش فنی را تا فردا تحویل دهید',
      time: '۳ ساعت پیش',
      read: true,
    },
    {
      id: 5,
      type: 'error',
      title: 'خطا در بارگذاری فایل',
      message: 'فایل "data.xlsx" بارگذاری نشد',
      time: '۵ ساعت پیش',
      read: true,
    },
  ])

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const typeIcons: Record<string, LucideIcon> = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertTriangle,
    message: MessageSquare,
  }

  const typeStyles: Record<string, string> = {
    info: 'bg-blue/10 text-blue',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    message: 'bg-brand/10 text-brand',
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-brand" />
          <h3 className="font-semibold text-foreground">{t('title')}</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={markAllAsRead}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={t('markAllAsRead')}
          >
            <Check className="size-4" />
          </button>
          <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      <div className="p-2 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === 'unread' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t('unread')}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === 'read' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t('read')}
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">{t('noNotifications')}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type]
            return (
              <div
                key={notification.id}
                className={`flex gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-brand/5' : ''
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-full ${typeStyles[notification.type]}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`font-medium text-foreground text-sm ${!notification.read ? 'font-semibold' : ''}`}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={t('markAsRead')}
                      >
                        <Check className="size-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-error"
                  title={t('delete')}
                >
                  <X className="size-4" />
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="p-3 border-t border-border flex justify-center">
        <button className="text-sm text-brand hover:underline">{t('viewAll')}</button>
      </div>
    </div>
  )
}
