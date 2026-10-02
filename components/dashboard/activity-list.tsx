'use client'

import { useTranslations } from 'next-intl'
import { activities } from '@/lib/dashboard-data'

export function ActivityList() {
  const t = useTranslations('dashboard')
  return (
    <div className="surface-panel p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
        <h2 className="text-sm font-bold text-foreground">{t('recentActivity')}</h2>
      </div>
      <ul className="flex flex-col">
        {activities.map((row, i) => (
          <li
            key={row.id}
            className={`flex items-start gap-3 py-3 sm:items-center ${i !== activities.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
              {row.user.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                <span className="font-semibold">{row.user}</span> {row.action}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{row.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
