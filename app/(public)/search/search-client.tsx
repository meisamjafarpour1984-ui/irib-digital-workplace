'use client'

import { useState } from 'react'
import { Search, Filter, User, X } from 'lucide-react'
import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'

export function SearchClient() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    contentType: 'all',
    dateRange: 'all',
    department: 'all',
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const contentTypes = [
    { id: 'all', label: 'همه محتوا' },
    { id: 'news', label: 'اخبار' },
    { id: 'announcement', label: 'اطلاعیه‌ها' },
    { id: 'event', label: 'رویدادها' },
    { id: 'document', label: 'مستندات' },
    { id: 'form', label: 'فرم‌ها' },
  ]

  const searchResults = [
    {
      id: 1,
      type: 'news',
      title: 'نشست هم‌اندیشی معاونت فناوری اطلاعات',
      excerpt:
        'در این نشست، برنامه‌های آینده معاونت فناوری اطلاعات و استراتژی‌های تحول دیجیتال مورد بررسی قرار گرفت.',
      author: 'محمد احمدی',
      date: '۱۴۰۳/۰۹/۱۵',
      department: 'فناوری اطلاعات',
      tags: ['نشست', 'تحول دیجیتال', 'استراتژی'],
    },
    {
      id: 2,
      type: 'announcement',
      title: 'اطلاعیه تعطیلی اداری',
      excerpt:
        'به اطلاع کلیه کارکنان می‌رساند به مناسبت فرا رسیدن سال نو، اداره مرکزی از تاریخ ۱۴۰۳/۱۲/۲۵ تا ۱۴۰۳/۱۲/۳۰ تعطیل است.',
      author: 'اداره کل',
      date: '۱۴۰۳/۱۲/۲۰',
      department: 'اداری',
      tags: ['تعطیلی', 'سال نو', 'اطلاعیه'],
    },
    {
      id: 3,
      type: 'document',
      title: 'راهنمای استفاده از سامانه اتوماسیون',
      excerpt:
        'این راهنما نحوه استفاده از سامانه اتوماسیون اداری را به صورت گام به گام توضیح می‌دهد.',
      author: 'واحد پشتیبانی',
      date: '۱۴۰۳/۰۹/۱۰',
      department: 'فناوری اطلاعات',
      tags: ['راهنما', 'اتوماسیون', 'پشتیبانی'],
    },
  ]

  const contentTypeLabels: Record<string, string> = {
    news: 'خبر',
    announcement: 'اطلاعیه',
    event: 'رویداد',
    document: 'مستند',
    form: 'فرم',
  }

  const contentTypeStyles: Record<string, string> = {
    news: 'bg-blue/10 text-blue',
    announcement: 'bg-warning/10 text-warning',
    event: 'bg-purple/10 text-purple',
    document: 'bg-green/10 text-green',
    form: 'bg-brand/10 text-brand',
  }

  const handleSearch = () => {
    console.warn('Searching for:', query, filters)
  }

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        {/* Search Header */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-8">
          <h1 className="mb-6 text-heading-1 text-foreground">جستجوی پیشرفته</h1>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در محتوا..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-xl border border-border bg-background pr-12 pl-4 py-3 text-base text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Search className="size-5" />
              جستجو
            </button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter}
                  className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm text-brand"
                >
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="rounded-full p-0.5 hover:bg-brand/20"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setActiveFilters([])}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                پاک کردن همه
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Filter className="size-5" />
                فیلترها
              </h3>

              <div className="space-y-6">
                {/* Content Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    نوع محتوا
                  </label>
                  <select
                    value={filters.contentType}
                    onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  >
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">تاریخ</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="all">همه زمان‌ها</option>
                    <option value="today">امروز</option>
                    <option value="week">هفته گذشته</option>
                    <option value="month">ماه گذشته</option>
                    <option value="year">سال گذشته</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">واحد</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="all">همه واحدها</option>
                    <option value="it">فناوری اطلاعات</option>
                    <option value="research">پژوهش</option>
                    <option value="production">تولید</option>
                    <option value="admin">اداری</option>
                  </select>
                </div>

                {/* Popular Tags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    برچسب‌های پرطرفدار
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['نشست', 'اطلاعیه', 'راهنما', 'تحول دیجیتال'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addFilter(tag)}
                        className="rounded-full bg-accent px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{searchResults.length} نتیجه یافت شد</p>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${contentTypeStyles[result.type]}`}
                    >
                      {contentTypeLabels[result.type]}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{result.date}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{result.department}</span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground">{result.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{result.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        {result.author}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {result.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                قبلی
              </button>
              <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white">۱</button>
              <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted">
                ۲
              </button>
              <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted">
                ۳
              </button>
              <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted">
                بعدی
              </button>
            </div>
          </div>
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
