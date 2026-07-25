'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { heroSlides } from '@/lib/portal-data'

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = heroSlides.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  )

  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (paused) return
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [paused, count])

  return (
    <section
      aria-label="اخبار برگزیده"
      aria-roledescription="carousel"
      className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border md:aspect-[21/9]"
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
          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {slide.category}
              </span>
              <h2 className="mt-3 text-balance text-xl font-extrabold leading-relaxed text-white md:text-3xl">
                {slide.title}
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-white/80 md:text-base">
                {slide.excerpt}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
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
        aria-label="اسلاید قبلی"
        className="absolute end-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <ChevronRight className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="اسلاید بعدی"
        className="absolute start-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`رفتن به اسلاید ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
