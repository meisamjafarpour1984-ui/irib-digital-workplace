'use client'

import { AlertTriangle, FileText } from 'lucide-react'
import { announcements as fallbackAnnouncements } from '@/lib/portal-data'
import { PanelHeader } from './panel-header'
import { AccessibleButton } from '@/components/ui/AccessibleButton'
import type { WidgetProps } from '@/components/widgets/types'
import { usePublishedContentFeed } from '@/hooks/use-portal-content'
import { formatRelativeTime } from '@/lib/jalali'
import { localizedText } from '@/lib/services/content'

type AnnouncementItem = {
  id: string
  title: string
  href: string
  time: string
  urgent?: boolean
  publishedAt?: string
}

export function Announcements({ config }: Partial<WidgetProps> = {}) {
  const limit = (config?.limit as number) ?? 5
  const seeded = config?.items as AnnouncementItem[] | undefined
  const { data } = usePublishedContentFeed('ANNOUNCEMENT', limit, !seeded?.length)

  const items: AnnouncementItem[] = seeded?.length
    ? seeded.map((item) => ({
        ...item,
        time: item.time || (item.publishedAt ? formatRelativeTime(item.publishedAt) : ''),
        href: item.href || `/news/${item.id}`,
      }))
    : data
      ? data.items.map((item) => ({
          id: item.id,
          title: localizedText(item.title),
          href: `/news/${item.slug}`,
          time: item.publishedAt ? formatRelativeTime(item.publishedAt) : '',
          urgent: Boolean((item.metadata as Record<string, unknown>)?.urgent),
        }))
      : fallbackAnnouncements.map((item) => ({
          id: item.id,
          title: item.title,
          href: `/announcements/${item.id}`,
          time: item.time,
          urgent: item.urgent,
        }))

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <PanelHeader title="اطلاعیه‌های اداری" moreLabel="مشاهده همه" moreHref="/announcements" />
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <AccessibleButton
              href={item.href}
              className="group flex w-full items-start gap-2.5 border-b border-border py-3 last:border-0 last:pb-0 text-right"
            >
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ${
                  item.urgent ? 'bg-warning/15 text-warning' : 'bg-brand-light text-brand'
                }`}
              >
                {item.urgent ? (
                  <AlertTriangle className="size-3.5" aria-hidden />
                ) : (
                  <FileText className="size-3.5" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors group-hover:text-brand">
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </AccessibleButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
