'use client'

import type { WidgetProps } from './types'
import { AccessibleButton } from '@/components/ui/AccessibleButton'
import { usePortalNews, type PortalNewsItem } from '@/hooks/use-portal-content'
import { formatRelativeTime } from '@/lib/jalali'
import { useTranslations } from 'next-intl'

export function NewsTimelineWidget({ config }: WidgetProps) {
  const t = useTranslations('widgets.newsTimeline')
  const limit = (config?.limit as number) ?? 5
  const seeded = config?.items as PortalNewsItem[] | undefined
  const normalizedSeeded = seeded?.map((item) => ({
    ...item,
    time: item.time || (item.publishedAt ? formatRelativeTime(item.publishedAt) : ''),
  }))
  const { items } = usePortalNews(limit, normalizedSeeded)
  const displayNews = items.slice(0, limit)

  return (
    <div className="surface-panel p-4">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-heading-1 text-foreground">{t('title')}</h2>
        </div>
        <AccessibleButton
          href="/news"
          className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
        >
          {t('viewAll')}
        </AccessibleButton>
      </div>
      <ul className="flex flex-col gap-3">
        {displayNews.map((item, i) => (
          <li
            key={item.id}
            className={i !== displayNews.length - 1 ? 'border-b border-border pb-3' : ''}
          >
            <AccessibleButton
              href={item.href || '#'}
              className="flex w-full items-start gap-3 text-right"
            >
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              <p className="text-sm text-foreground hover:text-brand">{item.title}</p>
            </AccessibleButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
