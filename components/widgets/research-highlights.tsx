'use client'

import { Users, Lightbulb } from 'lucide-react'
import type { WidgetProps } from './types'
import { useTranslations } from 'next-intl'

const experts = [
  { id: 'e1', nameKey: 'e1', titleKey: 'e1Title', initial: 'ع' },
  { id: 'e2', nameKey: 'e2', titleKey: 'e2Title', initial: 'س' },
  { id: 'e3', nameKey: 'e3', titleKey: 'e3Title', initial: 'ر' },
]

const ideas = [
  { id: 'i1', titleKey: 'i1', authorKey: 'i1Author' },
  { id: 'i2', titleKey: 'i2', authorKey: 'i2Author' },
  { id: 'i3', titleKey: 'i3', authorKey: 'i3Author' },
]

export function ResearchHighlightsWidget({ instance: _instance, config }: WidgetProps) {
  const t = useTranslations('widgets.researchHighlights')
  const expertLimit = (config?.expertLimit as number) ?? 3
  const ideaLimit = (config?.ideaLimit as number) ?? 3

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
          <h2 className="text-heading-1 text-foreground">{t('title')}</h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Experts */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="size-3.5" aria-hidden />
            {t('topExperts')}
          </div>
          <ul className="space-y-2">
            {experts.slice(0, expertLimit).map((expert) => (
              <li
                key={expert.id}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:border-brand/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
                  {expert.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {t(`experts.${expert.nameKey}`)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t(`experts.${expert.titleKey}`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Ideas */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lightbulb className="size-3.5" aria-hidden />
            {t('newIdeas')}
          </div>
          <ul className="space-y-2">
            {ideas.slice(0, ideaLimit).map((idea) => (
              <li
                key={idea.id}
                className="rounded-xl border border-border p-2.5 transition-colors hover:border-brand/40"
              >
                <p className="text-sm font-medium text-foreground">{t(`ideas.${idea.titleKey}`)}</p>
                <p className="text-xs text-muted-foreground">{t(`ideas.${idea.authorKey}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
