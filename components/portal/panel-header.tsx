'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'

export function PanelHeader({
  title,
  moreLabel,
  moreHref = '#',
}: {
  title: string
  moreLabel?: string
  moreHref?: string
}) {
  const t = useTranslations('common')
  const resolvedMoreLabel = moreLabel ?? t('viewAll')

  return (
    <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <a
        href={moreHref}
        className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
      >
        {resolvedMoreLabel}
        <ChevronLeft className="size-3.5" aria-hidden />
      </a>
    </div>
  )
}
