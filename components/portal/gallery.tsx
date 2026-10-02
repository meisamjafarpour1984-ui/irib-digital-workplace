'use client'

import { Play } from 'lucide-react'
import { galleryItems } from '@/lib/portal-data'
import { PanelHeader } from './panel-header'
import { useTranslations } from 'next-intl'

export function Gallery() {
  const t = useTranslations('portal.gallery')
  const [feature, ...rest] = galleryItems
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <PanelHeader title={t('title')} />

      <figure className="group relative mb-2.5 overflow-hidden rounded-xl">
        <img
          src={feature.image || '/placeholder.svg'}
          alt={feature.title}
          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand/90 text-primary-foreground backdrop-blur-sm">
            <Play className="size-5 ps-0.5" aria-hidden />
          </span>
        </span>
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-2.5 text-xs font-medium text-white">
          {feature.title}
        </figcaption>
      </figure>

      <ul className="grid grid-cols-3 gap-2">
        {rest.map((item) => (
          <li key={item.id}>
            <figure className="group relative overflow-hidden rounded-lg">
              <img
                src={item.image || '/placeholder.svg'}
                alt={item.title}
                className="h-16 w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-navy/25 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="size-4 text-white" aria-hidden />
              </span>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
