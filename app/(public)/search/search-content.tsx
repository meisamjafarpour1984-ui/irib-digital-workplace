'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, FileText, Calendar, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { localizedText, type ContentType } from '@/lib/services/content'
import { searchApi, type SearchResult } from '@/lib/services/search'

const filters: Array<{ label: string; value?: ContentType }> = [
  { label: 'همه' },
  { label: 'اخبار', value: 'NEWS' },
  { label: 'اطلاعیه‌ها', value: 'ANNOUNCEMENT' },
  { label: 'رویدادها', value: 'EVENT' },
  { label: 'گالری', value: 'GALLERY' },
]

const labels: Partial<Record<ContentType, string>> = {
  NEWS: 'خبر',
  ANNOUNCEMENT: 'اطلاعیه',
  EVENT: 'رویداد',
  GALLERY: 'گالری',
  BANNER: 'بنر',
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState<ContentType | undefined>()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < 2) {
      setResults([])
      setError('')
      setLoading(false)
      return
    }
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      searchApi
        .search(normalized, type)
        .then(({ results: items }) => {
          if (active) setResults(items)
        })
        .catch((caught) => {
          if (active) {
            setResults([])
            setError(caught instanceof Error ? caught.message : 'جست‌وجو انجام نشد')
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 300)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query, type])

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-display-lg text-foreground">جستجو</h1>
        <p className="mt-2 text-body-md text-muted-foreground">جستجو در محتوای منتشرشدهٔ درگاه</p>
      </div>
      <div className="relative mb-6">
        <Search
          className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="حداقل دو حرف وارد کنید..."
          className="w-full rounded-2xl border border-input bg-card py-4 pr-12 pl-4 text-lg text-foreground shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          aria-label="جستجو"
          autoFocus
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setType(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${type === filter.value ? 'bg-brand text-white' : 'border border-border bg-card text-muted-foreground hover:border-brand/30'}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div
          className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground"
          role="status"
        >
          <Loader2 className="size-5 animate-spin" />
          در حال جست‌وجو...
        </div>
      ) : error ? (
        <div
          className="rounded-2xl border border-error/20 bg-error/5 p-8 text-center text-error"
          role="alert"
        >
          <AlertCircle className="mx-auto size-8" />
          <p className="mt-3">{error}</p>
        </div>
      ) : query.trim().length < 2 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          برای شروع، حداقل دو حرف وارد کنید.
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Search className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-4 text-body-lg text-muted-foreground">نتیجه‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {results.length.toLocaleString('fa-IR')} نتیجه یافت شد
          </p>
          {results.map((result) => {
            const Icon = result.contentType === 'EVENT' ? Calendar : FileText
            return (
              <a
                key={result.id}
                href={`/news/${result.slug}`}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {labels[result.contentType] ?? 'محتوا'}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-foreground group-hover:text-brand">
                      {localizedText(result.title)}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {localizedText(result.excerpt)}
                    </p>
                  </div>
                  <ArrowLeft className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
