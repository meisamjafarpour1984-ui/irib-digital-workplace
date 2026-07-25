'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, FileText, Image, Users, Calendar, ArrowLeft } from 'lucide-react'

const mockResults = [
  { id: 1, type: 'خبر', title: 'برگزاری نشست هم‌اندیشی مدیران صدا و سیمای استان', excerpt: 'نشست هم‌اندیشی مدیران صدا و سیمای آذربایجان شرقی با حضور مدیرکل برگزار شد.', date: '۳ ساعت پیش', tag: 'اخبار مرکز' },
  { id: 2, type: 'اطلاعیه', title: 'اطلاعیه شماره ۱۴۰۲ در خصوص بیمه تکمیلی', excerpt: 'شرایط جدید بیمه تکمیلی کارکنان اعلام شد.', date: '۲ روز پیش', tag: 'اداری و مالی' },
  { id: 3, type: 'رویداد', title: 'جشنواره موسیقی نواحی آذربایجان', excerpt: 'جشنواره موسیقی نواحی آذربایجان شرقی در محل سالن همایش‌های مرکز برگزار می‌شود.', date: '۵ روز پیش', tag: 'فرهنگ و هنر' },
  { id: 4, type: 'نرم‌افزار', title: 'آنتی‌ویروس سازمانی نسخه ۲۰٫۴', excerpt: 'نسخه جدید آنتی‌ویروس سازمانی برای دانلود در دسترس است.', date: '۱ هفته پیش', tag: 'فناوری اطلاعات' },
  { id: 5, type: 'کارشناس', title: 'دکتر علی محمدی - پژوهشگر ارشد', excerpt: 'تخصص: هوش مصنوعی، پردازش زبان طبیعی، یادگیری عمیق', date: '—', tag: 'پژوهش' },
]

const typeIcons: Record<string, typeof FileText> = {
  'خبر': FileText,
  'اطلاعیه': FileText,
  'رویداد': Calendar,
  'نرم‌افزار': FileText,
  'کارشناس': Users,
  'تصویر': Image,
}

const typeColors: Record<string, string> = {
  'خبر': 'bg-brand/10 text-brand',
  'اطلاعیه': 'bg-warning/10 text-warning',
  'رویداد': 'bg-info/10 text-info',
  'نرم‌افزار': 'bg-success/10 text-success',
  'کارشناس': 'bg-gold/10 text-gold',
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState('همه')

  const filters = ['همه', 'اخبار', 'اطلاعیه‌ها', 'رویدادها', 'نرم‌افزارها', 'کارشناسان']

  const filteredResults = mockResults.filter((r) => {
    const matchesQuery = !query || r.title.includes(query) || r.excerpt.includes(query)
    const matchesFilter = activeFilter === 'همه' || r.type === activeFilter.replace('ها', '')
    return matchesQuery && matchesFilter
  })

  return (
    <div className="py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-display-lg text-foreground">جستجو</h1>
        <p className="mt-2 text-body-md text-muted-foreground">جستجو در تمام محتوا، نرم‌افزارها و کارشناسان</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="عبارت مورد نظر را جستجو کنید..."
          className="w-full rounded-2xl border border-input bg-card py-4 pr-12 pl-4 text-lg text-foreground shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          aria-label="جستجو"
          autoFocus
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-brand text-white'
                : 'bg-card border border-border text-muted-foreground hover:border-brand/30'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">{filteredResults.length} نتیجه یافت شد</p>
            {filteredResults.map((result) => {
              const Icon = typeIcons[result.type] || FileText
              return (
                <a
                  key={result.id}
                  href="#"
                  className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-brand/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${typeColors[result.type] || 'bg-muted'}`}>
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{result.type}</span>
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{result.tag}</span>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-foreground group-hover:text-brand transition-colors">{result.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{result.excerpt}</p>
                      <span className="mt-2 block text-[10px] text-muted-foreground">{result.date}</span>
                    </div>
                    <ArrowLeft className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </div>
                </a>
              )
            })}
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Search className="mx-auto size-12 text-muted-foreground/30" aria-hidden />
            <p className="mt-4 text-body-lg text-muted-foreground">نتیجه‌ای یافت نشد</p>
            <p className="mt-1 text-sm text-muted-foreground/60">عبارت جستجو را تغییر دهید</p>
          </div>
        )}
      </div>
    </div>
  )
}
