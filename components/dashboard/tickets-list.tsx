'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { softwareApi } from '@/lib/services/software'
import { tickets as fallbackTickets } from '@/lib/dashboard-data'
import { formatJalaliDateTime } from '@/lib/jalali'
import { AccessibleButton } from '@/components/ui/AccessibleButton'

const statusStyles: Record<string, string> = {
  open: 'bg-info/10 text-info',
  inProgress: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
}

const fallbackStatusMap: Record<string, string> = {
  'در حال بررسی': 'inProgress',
  جدید: 'open',
  'پاسخ داده شد': 'resolved',
}

interface DisplayTicket {
  id: string
  title: string
  time: string
  statusLabel: string
  statusKey: string
}

export function TicketsList() {
  const t = useTranslations('dashboard')
  const tTicket = useTranslations('ticket')

  const statusKeys: Record<string, string> = {
    NEW: 'open',
    IN_PROGRESS: 'inProgress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  }

  function ticketTitle(value: unknown): string {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const record = value as Record<string, string>
      return record.fa ?? record.en ?? t('noTitle')
    }
    return t('noTitle')
  }

  function mapTickets(rows: Awaited<ReturnType<typeof softwareApi.listTickets>>): DisplayTicket[] {
    if (!Array.isArray(rows)) return []
    return rows.map((row) => {
      const statusKey = statusKeys[row.status] ?? 'open'
      return {
        id: row.id,
        title: ticketTitle(row.title),
        time: formatJalaliDateTime(row.createdAt).split(' ')[1] ?? '',
        statusLabel: tTicket(`status.${statusKey}`),
        statusKey,
      }
    })
  }

  function mapFallback(): DisplayTicket[] {
    return fallbackTickets.map((row) => {
      const statusKey = fallbackStatusMap[row.status] ?? 'open'
      return {
        id: row.id,
        title: row.title,
        time: row.time,
        statusLabel: tTicket(`status.${statusKey}`),
        statusKey,
      }
    })
  }

  const { data } = useQuery({
    queryKey: ['dashboard-tickets'],
    queryFn: () => softwareApi.listTickets({ limit: 5 }),
    staleTime: 60_000,
    retry: 1,
  })

  const rows: DisplayTicket[] = data && Array.isArray(data) ? mapTickets(data) : mapFallback()

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">{t('recentTickets')}</h2>
        </div>
        <AccessibleButton
          href="/dashboard/tickets"
          className="text-xs font-medium text-brand hover:underline"
        >
          {t('viewAllTickets')}
        </AccessibleButton>
      </div>
      <ul className="flex flex-col">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className={`flex items-center justify-between gap-3 py-3 ${i !== rows.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{row.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {t('time', { time: row.time })}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.statusKey]}`}
            >
              {row.statusLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
