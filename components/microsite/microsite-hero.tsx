import Image from 'next/image'
import { Radio } from 'lucide-react'
import { microStats } from '@/lib/microsite-data'

export function MicrositeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy text-white shadow-lg">
      <div className="peds-pattern absolute inset-0 opacity-25" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-l from-navy/40 via-navy/80 to-navy" aria-hidden />

      <div className="relative grid items-center gap-6 p-8 md:grid-cols-2 md:p-12">
        <div className="text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/15">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            پرتال دیجیتال کارکنان
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-balance md:text-4xl">
            معاونت فناوری اطلاعات
          </h1>
          <p className="mt-2 text-lg font-semibold text-brand">نوآوری، پشتیبانی، توسعه</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            معاونت فناوری اطلاعات با هدف پشتیبانی از زیرساخت‌های فنی و ارائه خدمات نوین به کارکنان، همواره در مسیر تحول
            دیجیتال سازمان گام برمی‌دارد.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              ثبت درخواست پشتیبانی
            </button>
            <button
              type="button"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              مشاهده سامانه‌ها
            </button>
          </div>
        </div>

        <div className="relative hidden aspect-[4/3] md:block">
          <Image src="/images/it-hero.png" alt="زیرساخت فناوری اطلاعات مرکز" fill className="object-contain" priority />
          <div className="absolute bottom-2 left-2 flex size-14 items-center justify-center rounded-2xl bg-white/10 text-brand ring-1 ring-white/15 backdrop-blur">
            <Radio className="size-7" aria-hidden />
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-px border-t border-white/10 bg-white/5 md:grid-cols-4">
        {microStats.map((stat) => (
          <div key={stat.label} className="px-6 py-4 text-center">
            <p className="text-xl font-extrabold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
