'use client'

import { useQuery } from '@tanstack/react-query'
import { softwareApi } from '@/lib/services/software'
import { tickets as fallbackTickets, type TicketRow } from '@/lib/dashboard-data'
import { formatJalaliDateTime } from '@/lib/jalali'
import { AccessibleButton } from '@/components/ui/AccessibleButton'

const statusStyles: Record<TicketRow['status'], string> = {
  'در حال بررسی': 'bg-warning/10 text-warning',
  جدید: 'bg-info/10 text-info',
  'پاسخ داده شد': 'bg-success/10 text-success',
}

const statusLabels: Record<string, TicketRow['status']> = {
  NEW: 'جدید',
  IN_PROGRESS: 'در حال بررسی',
  RESOLVED: 'پاسخ داده شد',
  CLOSED: 'پاسخ داده شد',
}

function ticketTitle(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, string>
    return record.fa ?? record.en ?? 'بدون عنوان'
  }
  return 'بدون عنوان'
}

function mapTickets(rows: Awaited<ReturnType<typeof softwareApi.listTickets>>): TicketRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: ticketTitle(row.title),
    time: formatJalaliDateTime(row.createdAt).split(' ')[1] ?? '',
    status: statusLabels[row.status] ?? 'جدید',
  }))
}

export function TicketsList() {
  const { data } = useQuery({
    queryKey: ['dashboard-tickets'],
    queryFn: () => softwareApi.listTickets({ limit: 5 }),
    staleTime: 60_000,
    retry: 1,
  })

  const rows = data ? mapTickets(data) : fallbackTickets

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">آخرین تیکت‌ها</h2>
        </div>
        <AccessibleButton
          href="/dashboard/tickets"
          className="text-xs font-medium text-brand hover:underline"
        >
          مشاهده همه
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
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">ساعت {row.time}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
            >
              {row.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
