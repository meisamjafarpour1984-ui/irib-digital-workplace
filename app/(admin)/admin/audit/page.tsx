'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Download, Search, User, FileText, Settings, Shield, Loader2 } from 'lucide-react'
import { useAuditLogs } from '@/hooks/use-audit-logs'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

const categoryStyles: Record<string, { bg: string; text: string; icon: typeof FileText }> = {
  content: { bg: 'bg-brand/10', text: 'text-brand', icon: FileText },
  user: { bg: 'bg-info/10', text: 'text-info', icon: User },
  system: { bg: 'bg-success/10', text: 'text-success', icon: Settings },
  security: { bg: 'bg-warning/10', text: 'text-warning', icon: Shield },
}

export default function AuditLogPage() {
  const { logs, stats, loading, error, exportLogs } = useAuditLogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.user?.name || '').includes(searchTerm) ||
      log.action.includes(searchTerm) ||
      log.entity.includes(searchTerm)
    const matchesCategory = categoryFilter === 'all' || log.entity === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportLogs({ format })
    } catch {
      alert('خطا در خروجی گرفتن')
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">لاگ فعالیت‌ها</h1>
              <p className="mt-1 text-body-md text-muted-foreground">
                {stats?.totalLogs || 0} فعالیت ثبت شده
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="size-4" aria-hidden />
                خروجی CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="size-4" aria-hidden />
                خروجی JSON
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:min-w-72">
              <Search
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
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
                { id: 'User', label: 'کاربر' },
                { id: 'Content', label: 'محتوا' },
                { id: 'SystemSetting', label: 'سیستم' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted'
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
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    کاربر
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    عملیات
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    موجودیت
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    شناسه
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">IP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-brand" />
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      هیچ لاگی یافت نشد
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const category =
                      log.entity === 'User'
                        ? 'user'
                        : log.entity === 'Content'
                          ? 'content'
                          : log.entity === 'SystemSetting'
                            ? 'system'
                            : 'security'
                    const style = categoryStyles[category] || categoryStyles.system
                    const Icon = style.icon
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="p-3 text-xs text-muted-foreground tabular-nums">
                          {new Date(log.createdAt).toLocaleString('fa-IR')}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-brand">
                              {log.user?.name?.slice(0, 1) || '?'}
                            </div>
                            <span className="text-sm text-foreground">
                              {log.user?.name || 'ناشناس'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                          >
                            <Icon className="size-3" aria-hidden />
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-foreground">{log.entity}</td>
                        <td className="p-3 text-sm text-muted-foreground">{log.entityId || '-'}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {log.ipAddress || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    </div>
  )
}
