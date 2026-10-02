'use client'

import { quickLinks } from '@/lib/portal-data'
import type { WidgetProps } from './types'
import { useTranslations } from 'next-intl'

export function QuickAccessWidget({ config }: WidgetProps) {
  const t = useTranslations('widgets.quickAccess')
  const maxItems = (config?.maxItems as number) ?? 10
  const displayLinks = quickLinks.slice(0, maxItems)

  return (
    <div className="surface-panel p-4 sm:p-5">
      <h2 className="mb-4 text-center text-heading-1 text-foreground">{t('title')}</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        {displayLinks.map(({ label, icon: Icon, href }) => (
          <li key={label}>
            <a
              href={href}
              className="flex min-h-24 h-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-3 text-center transition-colors hover:border-brand/40 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-xs font-medium leading-snug text-foreground">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
