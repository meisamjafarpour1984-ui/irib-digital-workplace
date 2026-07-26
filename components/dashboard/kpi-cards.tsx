import { TrendingUp, TrendingDown } from 'lucide-react'
import { kpis } from '@/lib/dashboard-data'

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {kpis.map((kpi) => {
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
