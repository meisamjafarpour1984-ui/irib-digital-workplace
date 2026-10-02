/**
 * IRIB Digital Workplace Platform - News Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Newspaper, Calendar, ArrowLeft, Search, Filter, Loader2 } from 'lucide-react'
import { useNews } from '@/hooks/use-news'

export default function NewsPage() {
  const { news, loading } = useNews()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UtilityBar />
        <PortalHeader />
        <main className="flex items-center justify-center p-6">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </main>
        <PortalFooter />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            بازگشت به صفحه اصلی
          </a>
        </div>

        <div className="mb-8">
          <h1 className="text-heading-1 text-foreground">اخبار و رویدادها</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            آخرین اخبار و رویدادهای مرکز صدا و سیمای آذربایجان شرقی
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو در اخبار..."
              className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
            <Filter className="size-4" />
            فیلتر
          </button>
        </div>

        {/* Featured News */}
        {news.length > 0 && (
          <div className="mb-8 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                  <Newspaper className="size-3" />
                  خبر ویژه
                </span>
                <h2 className="mt-4 text-heading-1 text-foreground">
                  {typeof news[0].title === 'string'
                    ? news[0].title
                    : (news[0].title as { fa?: string; en?: string })?.fa ||
                      (news[0].title as { fa?: string; en?: string })?.en ||
                      ''}
                </h2>
                <p className="mt-3 text-body-lg text-muted-foreground">
                  {typeof news[0].excerpt === 'string'
                    ? news[0].excerpt
                    : (news[0].excerpt as { fa?: string; en?: string })?.fa ||
                      (news[0].excerpt as { fa?: string; en?: string })?.en ||
                      ''}
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {news[0].publishedAt
                      ? new Date(news[0].publishedAt).toLocaleDateString('fa-IR')
                      : ''}
                  </div>
                </div>
                <a
                  href={`/news/${news[0].slug}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand/90"
                >
                  ادامه مطلب
                  <ArrowLeft className="size-4" />
                </a>
              </div>
              <div className="relative bg-accent flex items-center justify-center">
                <Newspaper className="size-32 text-muted-foreground/20" />
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.slice(1).map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-brand/40"
            >
              <div className="relative h-48 bg-accent flex items-center justify-center">
                <Newspaper className="size-16 text-muted-foreground/20" />
              </div>
              <div className="p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-foreground">
                  {item.contentType || item.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {typeof item.title === 'string'
                    ? item.title
                    : (item.title as { fa?: string; en?: string })?.fa ||
                      (item.title as { fa?: string; en?: string })?.en ||
                      ''}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {typeof item.excerpt === 'string'
                    ? item.excerpt
                    : (item.excerpt as { fa?: string; en?: string })?.fa ||
                      (item.excerpt as { fa?: string; en?: string })?.en ||
                      ''}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3" />
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('fa-IR') : ''}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {news.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Newspaper className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-4 text-body-lg text-muted-foreground">خبری موجود نیست</p>
          </div>
        )}
      </main>

      <PortalFooter />
    </div>
  )
}
