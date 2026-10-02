import { PanelHeader } from '@/components/portal/panel-header'
import { itNews } from '@/lib/microsite-data'
import { useTranslations } from 'next-intl'

export function ItNews() {
  const t = useTranslations('microsite.itNews')
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <PanelHeader title={t('title')} />
      <ul className="flex flex-col">
        {itNews.map((item, i) => (
          <li key={item.id} className={i !== itNews.length - 1 ? 'border-b border-border' : ''}>
            <a href="/news" className="group flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                <span className="text-sm text-foreground group-hover:text-brand">{item.title}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
