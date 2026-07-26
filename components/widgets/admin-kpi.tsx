'use client'

import { TrendingUp, Users, Eye, FileText, MessageSquare } from 'lucide-react'
import type { WidgetProps } from './types'

const kpis = [
  {
    id: 'k1',
    label: 'بازدید امروز',
    value: '۲٬۷۴۵',
    delta: '+۲۹٪',
    trend: 'up' as const,
    icon: Eye,
  },
  {
    id: 'k2',
    label: 'کاربران فعال',
    value: '۲۰۳',
    delta: '+۱۳٪',
    trend: 'up' as const,
    icon: Users,
  },
  {
    id: 'k3',
    label: 'محتوای منتشر شده',
    value: '۴۸',
    delta: '+۹٪',
    trend: 'up' as const,
    icon: FileText,
  },
  {
    id: 'k4',
    label: 'پیام‌های جدید',
    value: '۱۲۵',
    delta: '+۱۸٪',
    trend: 'up' as const,
    icon: MessageSquare,
  },
]

export function AdminKPIWidget({ config }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
        <h2 className="text-heading-1 text-foreground">شاخص‌های کلیدی عملکرد</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-brand">
                  <Icon className="size-5" aria-hidden />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-bold text-success">
                  <TrendingUp className="size-3" aria-hidden />
                  {kpi.delta}
                </span>
              </div>
              <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
