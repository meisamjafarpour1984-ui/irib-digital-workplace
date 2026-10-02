'use client'

import { useTranslations } from 'next-intl'
import { FileText, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import type { WidgetProps } from './types'

const forms = [
  { id: 'f1', status: 'open', deadline: '۱۴۰۴/۰۳/۲۰', submissions: 45 },
  { id: 'f2', status: 'open', deadline: '۱۴۰۴/۰۳/۲۵', submissions: 120 },
  { id: 'f3', status: 'closed', deadline: '۱۴۰۴/۰۳/۱۰', submissions: 89 },
  { id: 'f4', status: 'open', deadline: 'ندارد', submissions: 23 },
]

export function DeptFormsCenterWidget({ instance: _instance, config: _config }: WidgetProps) {
  const t = useTranslations('widgets.formsCenter')
  const statusLabels: Record<string, string> = {
    open: t('status.open'),
    closed: t('status.closed'),
  }
  const statusColors: Record<string, string> = {
    open: 'bg-success/10 text-success',
    closed: 'bg-muted text-muted-foreground',
  }
  const statusIcons: Record<string, typeof Clock> = {
    open: Clock,
    closed: CheckCircle,
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('activeCount', { n: forms.filter((f) => f.status === 'open').length })}
        </span>
      </div>
      <ul className="space-y-2">
        {forms.map((form) => {
          const Icon = statusIcons[form.status] ?? Clock
          return (
            <li
              key={form.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
                <FileText className="size-4.5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {t(`items.${form.id}.title`)}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${statusColors[form.status]}`}
                  >
                    <Icon className="size-3" aria-hidden />
                    {statusLabels[form.status]}
                  </span>
                  <span>{t('submissions', { n: form.submissions })}</span>
                </div>
              </div>
              {form.status === 'open' && (
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  {t('completeForm')}
                  <ArrowLeft className="size-3" aria-hidden />
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
