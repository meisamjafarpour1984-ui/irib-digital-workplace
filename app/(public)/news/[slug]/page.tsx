'use client'

import { use, useEffect, useState } from 'react'
import { ArrowRight, Calendar, User, Share2, Printer, RefreshCw } from 'lucide-react'
import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Container } from '@/components/layout/container'
import { contentApi, contentHtml, localizedText, type ContentRecord } from '@/lib/services/content'

const contentTypeLabels: Record<string, string> = {
  NEWS: 'اخبار مرکز',
  ANNOUNCEMENT: 'اطلاعیه',
  EVENT: 'رویداد',
  GALLERY: 'گالری',
}

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [article, setArticle] = useState<ContentRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setArticle(null)
    contentApi
      .findPublished(slug)
      .then((record) => {
        if (active) setArticle(record)
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : 'خبر در دسترس نیست')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  const title = localizedText(article?.title)
  const excerpt = localizedText(article?.excerpt)
  const category = contentTypeLabels[article?.contentType ?? ''] ?? 'محتوا'
  const publishedDate = article?.publishedAt
    ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(article.publishedAt))
    : ''

  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <Container>
        {loading ? (
          <div
            className="flex min-h-96 items-center justify-center gap-3 text-muted-foreground"
            role="status"
          >
            <RefreshCw className="size-5 animate-spin" aria-hidden />
            در حال دریافت خبر...
          </div>
        ) : error || !article ? (
          <div className="mx-auto my-16 max-w-xl rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <h1 className="text-heading-1 text-foreground">خبر پیدا نشد</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || 'این خبر در دسترس نیست.'}
            </p>
            <a
              href="/"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-primary-foreground"
            >
              <ArrowRight className="size-4" aria-hidden />
              بازگشت به صفحه اصلی
            </a>
          </div>
        ) : (
          <article className="py-8">
            <nav
              className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
              aria-label="مسیر صفحه"
            >
              <a
                href="/"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                صفحه اصلی
              </a>
              <span>/</span>
              <span>اخبار</span>
              <span>/</span>
              <span className="text-foreground">{category}</span>
            </nav>

            <div className="mb-8">
              <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {category}
              </span>
              <h1 className="mt-3 text-display-lg text-foreground">{title}</h1>
              {excerpt && <p className="mt-3 max-w-3xl text-muted-foreground">{excerpt}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="size-4" aria-hidden />
                  {localizedText(article.author.name)}
                </span>
                {publishedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" aria-hidden />
                    {publishedDate}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8 flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(window.location.href)}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Share2 className="size-3.5" aria-hidden />
                اشتراک‌گذاری
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Printer className="size-3.5" aria-hidden />
                چاپ
              </button>
            </div>

            <div
              className="prose prose-sm max-w-none text-foreground prose-headings:font-bold prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: contentHtml(article.body) }}
            />

            {article.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {article.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </Container>

      <PortalFooter />
    </div>
  )
}
