'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/lib/portal-data'
import { useHeroSlides } from '@/hooks/use-portal-content'
import type { WidgetProps } from './types'
import { useTranslations } from 'next-intl'

export function HeroMediaWidget({ config }: WidgetProps) {
  const t = useTranslations('widgets.heroMedia')
  const autoPlay = (config?.autoPlay as boolean) ?? true
  const interval = (config?.interval as number) ?? 5000
  const seededSlides = config?.slides as HeroSlide[] | undefined

  const { slides: heroSlides } = useHeroSlides(
    typeof config?.limit === 'number' ? config.limit : 5,
    seededSlides
  )

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = Math.max(heroSlides.length, 1)

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + count) % count), [count])

  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!autoPlay || paused || heroSlides.length === 0) return
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [paused, count, autoPlay, interval, heroSlides.length])

  if (heroSlides.length === 0) {
    return null
  }

  return (
    <section
      aria-label={t('carouselLabel')}
      aria-roledescription="carousel"
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-navy shadow-sm sm:aspect-[16/9] lg:aspect-[21/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(-1)
        if (e.key === 'ArrowLeft') go(1)
      }}
      tabIndex={0}
    >
      {heroSlides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <img
            src={slide.image || '/placeholder.svg'}
            alt={slide.title}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="size-full object-cover"
          />
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/20 bg-navy/70 px-3 py-1 text-xs font-medium text-white">
                {slide.category}
              </span>
              <h2 className="mt-2 text-balance text-xl font-bold leading-relaxed text-white sm:mt-3 sm:text-display-lg">
                {slide.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-white/80 sm:text-body-lg">
                {slide.excerpt}
              </p>
              <button
                type="button"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover sm:mt-4"
              >
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={t('prevSlide')}
        className="absolute end-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-navy/70 text-white transition-colors hover:bg-navy sm:end-3"
      >
        <ChevronRight className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={t('nextSlide')}
        className="absolute start-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-navy/70 text-white transition-colors hover:bg-navy sm:start-3"
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-1 start-1/2 flex -translate-x-1/2 gap-0.5">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t('goToSlide', { n: i + 1 })}
            aria-current={i === index}
            className="flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
          >
            <span
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
