import { ChevronLeft } from 'lucide-react'
import { PanelHeader } from '@/components/portal/panel-header'
import { itAnnouncements } from '@/lib/microsite-data'
import { AccessibleButton } from '@/components/ui/AccessibleButton'
import { useTranslations } from 'next-intl'

export function ItAnnouncements() {
  const t = useTranslations('microsite.itAnnouncements')
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <PanelHeader title={t('title')} moreLabel={t('moreLabel')} />
      <ul className="flex flex-col">
        {itAnnouncements.map((item, i) => {
          const Icon = item.icon
          return (
            <li
              key={item.id}
              className={i !== itAnnouncements.length - 1 ? 'border-b border-border' : ''}
            >
              <AccessibleButton
                href="/announcements/1"
                className="group flex w-full items-center gap-3 py-3 text-right"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
                  <Icon className="size-4.5" aria-hidden />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground group-hover:text-brand">
                  {item.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                <ChevronLeft
                  className="size-4 shrink-0 text-muted-foreground group-hover:text-brand"
                  aria-hidden
                />
              </AccessibleButton>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
