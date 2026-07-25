'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Download, Search, User, FileText, Settings, Shield } from 'lucide-react'

interface AuditLogEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  entity: string
  entityTitle: string
  ip: string
  userAgent: string
  category: 'content' | 'user' | 'system' | 'security'
}

const auditLogs: AuditLogEntry[] = [
  { id: 'a1', timestamp: '۱۴۰۴/۰۳/۱۲ ۱۰:۱۵', actor: 'محمد احمدی', action: 'انتشار', entity: 'خبر', entityTitle: 'برگزاری نشست هم‌اندیشی', ip: '192.168.1.100', userAgent: 'Chrome 120', category: 'content' },
  { id: 'a2', timestamp: '۱۴۰۴/۰۳/۱۲ ۱۰:۱۰', actor: 'علی رضایی', action: 'ایجاد', entity: 'فرم', entityTitle: 'نظرسنجی رضایت کارکنان', ip: '192.168.1.101', userAgent: 'Firefox 121', category: 'content' },
  { id: 'a3', timestamp: '۱۴۰۴/۰۳/۱۲ ۱۰:۰۵', actor: 'مدیر سیستم', action: 'تغییر نقش', entity: 'کاربر', entityTitle: 'سارا موسوی → کارشناس', ip: '192.168.1.1', userAgent: 'Chrome 120', category: 'security' },
  { id: 'a4', timestamp: '۱۴۰۴/۰۳/۱۲ ۰۹:۵۵', actor: 'رضا کریمی', action: 'تأیید', entity: 'کاربر', entityTitle: 'مریم حسنی', ip: '192.168.1.102', userAgent: 'Edge 120', category: 'user' },
  { id: 'a5', timestamp: '۱۴۰۴/۰۳/۱۲ ۰۹:۴۵', actor: 'مریم حسنی', action: 'دانلود', entity: 'نرم‌افزار', entityTitle: 'آنتی‌ویروس سازمانی v20.4', ip: '192.168.1.103', userAgent: 'Chrome 120', category: 'system' },
  { id: 'a6', timestamp: '۱۴۰۴/۰۳/۱۲ ۰۹:۳۰', actor: 'مدیر سیستم', action: 'تغییر تم', entity: 'پوسته', entityTitle: 'فعال‌سازی تم محرم', ip: '192.168.1.1', userAgent: 'Chrome 120', category: 'system' },
  { id: 'a7', timestamp: '۱۴۰۴/۰۳/۱۲ ۰۹:۱۵', actor: 'علی رضایی', action: 'بایگانی', entity: 'اطلاعیه', entityTitle: 'اطلاعیه شماره ۱۴۰۲', ip: '192.168.1.101', userAgent: 'Firefox 121', category: 'content' },
  { id: 'a8', timestamp: '۱۴۰۴/۰۳/۱۲ ۰۹:۰۰', actor: 'ناشناس', action: 'تلاش ورود ناموفق', entity: 'احراز هویت', entityTitle: 'کد پرسنلی: ۱۲۳۴', ip: '45.33.12.5', userAgent: 'Chrome 120', category: 'security' },
]

const categoryStyles: Record<AuditLogEntry['category'], { bg: string; text: string; icon: typeof FileText }> = {
  content: { bg: 'bg-brand/10', text: 'text-brand', icon: FileText },
  user: { bg: 'bg-info/10', text: 'text-info', icon: User },
  system: { bg: 'bg-success/10', text: 'text-success', icon: Settings },
  security: { bg: 'bg-warning/10', text: 'text-warning', icon: Shield },
}

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = log.actor.includes(searchTerm) || log.entityTitle.includes(searchTerm) || log.action.includes(searchTerm)
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">لاگ فعالیت‌ها</h1>
              <p className="mt-1 text-body-md text-muted-foreground">مشاهده و خروجی فعالیت‌های سیستم</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="size-4" aria-hidden />
              خروجی CSV
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:min-w-72">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="جستجو در فعالیت‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                aria-label="جستجو در فعالیت‌ها"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              {[
                { id: 'all', label: 'همه' },
                { id: 'content', label: 'محتوا' },
                { id: 'user', label: 'کاربر' },
                { id: 'system', label: 'سیستم' },
                { id: 'security', label: 'امنیت' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === cat.id ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Log Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">زمان</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">کاربر</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">عملیات</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">موجودیت</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">جزئیات</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const style = categoryStyles[log.category]
                  const Icon = style.icon
                  return (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-xs text-muted-foreground tabular-nums">{log.timestamp}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-brand">
                            {log.actor.slice(0, 1)}
                          </div>
                          <span className="text-sm text-foreground">{log.actor}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                          <Icon className="size-3" aria-hidden />
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-foreground">{log.entity}</td>
                      <td className="p-3 text-sm text-muted-foreground">{log.entityTitle}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    </div>
  )
}
