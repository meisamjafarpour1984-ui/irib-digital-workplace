'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Eye,
  FileText,
  Ticket,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { analyticsApi } from '@/lib/services/analytics'
import { kpis as fallbackKpis } from '@/lib/dashboard-data'

type KpiCard = {
  id: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: LucideIcon
}

function formatCount(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value)
}

function buildKpisFromApi(data: {
  activeUsers: number
  publishedContent: number
  openTickets: number
  views?: number
}): KpiCard[] {
  return [
    {
      id: 'views',
      label: 'بازدید (دوره)',
      value: formatCount(data.views ?? 0),
      delta: '—',
      trend: 'up',
      icon: Eye,
    },
    {
      id: 'content',
      label: 'محتوای منتشرشده',
      value: formatCount(data.publishedContent),
      delta: 'فعال',
      trend: 'up',
      icon: FileText,
    },
    {
      id: 'users',
      label: 'کاربران فعال',
      value: formatCount(data.activeUsers),
      delta: '—',
      trend: 'up',
      icon: Activity,
    },
    {
      id: 'tickets',
      label: 'تیکت‌های باز',
      value: formatCount(data.openTickets),
      delta: data.openTickets > 0 ? 'نیاز به پیگیری' : 'بدون تیکت',
      trend: data.openTickets > 0 ? 'down' : 'up',
      icon: Ticket,
    },
  ]
}

export function KpiCards() {
  const { data: cards } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const [kpi, stats] = await Promise.all([
        analyticsApi.getKpis(),
        analyticsApi.getContentStats('day'),
      ])
      return buildKpisFromApi({ ...kpi, views: stats.views })
    },
    staleTime: 60_000,
    retry: 1,
  })

  const display =
    cards ??
    fallbackKpis.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      delta: kpi.delta,
      trend: kpi.trend,
      icon: kpi.icon,
    }))

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {display.map((kpi) => {
        const Icon = kpi.icon
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown
        return (
          <div key={kpi.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-brand">
                <Icon className="size-5.5" aria-hidden />
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                  kpi.trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}
              >
                <TrendIcon className="size-3.5" aria-hidden />
                {kpi.delta}
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{kpi.label}</p>
          </div>
        )
      })}
    </div>
  )
}
