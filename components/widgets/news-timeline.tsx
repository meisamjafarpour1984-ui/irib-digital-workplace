'use client'

import { latestNews } from '@/lib/portal-data'
import type { WidgetProps } from './types'

export function NewsTimelineWidget({ config }: WidgetProps) {
  const limit = (config?.limit as number) ?? 5
  const displayNews = latestNews.slice(0, limit)

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-heading-1 text-foreground">آخرین اخبار</h2>
        </div>
        <a href="#" className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline">
          مشاهده همه
        </a>
      </div>
      <ul>
        {displayNews.map((item) => (
          <li key={item.id}>
            <a
              href="#"
              className="group flex flex-col gap-1 border-b border-border py-3 last:border-0 last:pb-0"
            >
              <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors group-hover:text-brand">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-brand">
                  {item.tag}
                </span>
                <span>{item.time}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
