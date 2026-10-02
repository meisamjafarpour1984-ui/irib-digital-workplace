/**
 * IRIB Digital Workplace Platform - Content Preview Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, Calendar, User, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

const typeLabels: Record<string, string> = {
  news: 'خبر',
  article: 'مقاله',
  announcement: 'اطلاعیه',
  event: 'رویداد',
  page: 'صفحه',
}

const typeIcons: Record<string, string> = {
  news: '📰',
  article: '📝',
  announcement: '📢',
  event: '📅',
  page: '📄',
}

function ContentPreviewContent() {
  const searchParams = useSearchParams()
  const previewData = searchParams.get('data')

  if (!previewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">داده‌ای برای پیش‌نمایش یافت نشد</p>
        </div>
      </div>
    )
  }

  let data: Record<string, unknown>
  try {
    data = JSON.parse(decodeURIComponent(previewData))
  } catch {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">خطا در خواندن داده‌های پیش‌نمایش</p>
        </div>
      </div>
    )
  }

  const { title, contentType, content, tags, published, featured } = data as {
    title: string
    contentType: string
    content: string
    tags: string[]
    published: boolean
    featured: boolean
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.close()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            بستن پیش‌نمایش
          </Button>
          <div className="flex items-center gap-2">
            {featured && (
              <span className="px-3 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-full">
                ویژه
              </span>
            )}
            {published && (
              <span className="px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                منتشر شده
              </span>
            )}
            {!published && (
              <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-semibold rounded-full">
                پیش‌نویس
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Type Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">{typeIcons[contentType] || '📄'}</span>
          <span className="text-sm text-muted-foreground">
            {typeLabels[contentType] || 'محتوا'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-6">{title || 'بدون عنوان'}</h1>

        {/* Meta */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>ادمین سیستم</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('fa-IR')}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-lg max-w-none mb-8">
          <div
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: content || '<p class="text-muted-foreground">محتوایی وارد نشده است</p>',
            }}
          />
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">برچسب‌ها</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-accent text-foreground text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          این یک پیش‌نمایش است و محتوا هنوز ذخیره نشده است
        </div>
      </footer>
    </div>
  )
}

export default function ContentPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ContentPreviewContent />
    </Suspense>
  )
}
