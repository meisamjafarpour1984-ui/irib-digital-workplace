'use client'

import { ArrowRight, Calendar, User, Share2, Bookmark, Printer } from 'lucide-react'
import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Container } from '@/components/layout/container'

const mockArticle = {
  title: 'برگزاری نشست هم‌اندیشی مدیران صدا و سیمای استان',
  category: 'اخبار مرکز',
  author: 'محمد احمدی',
  date: '۱۲ خرداد ۱۴۰۴',
  readTime: '۳ دقیقه مطالعه',
  content: `
    <p>نشست هم‌اندیشی مدیران صدا و سیمای آذربایجان شرقی با حضور مدیرکل و معاونین برگزار شد.</p>
    <p>در این نشست در خصوص برنامه‌های عملیاتی سال جاری، چالش‌های فنی و راهکارهای بهبود کیفیت تولید محتو بحث و تبادل نظر شد.</p>
    <h2>محورهای اصلی نشست</h2>
    <ul>
      <li>بررسی عملکرد بخش‌های مختلف در سال گذشته</li>
      <li>ارائه برنامه‌های تحول دیجیتال مرکز</li>
      <li>بهره‌برداری از تجهیزات پیشرفته استودیوی جدید</li>
      <li>هماهنگی بین معاونت‌های تولید و فناوری اطلاعات</li>
    </ul>
    <p>مدیرکل صدا و سیمای آذربایجان شرقی در پایان نشست بر اهمیت همکاری تیمی و استفاده بهینه از منابع سازمانی تأکید کرد.</p>
  `,
  image: '/images/news-detail.png',
  tags: ['نشست', 'مدیران', 'صدا و سیما'],
}

export default function NewsDetailPage({ params: _params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <Container>
        <article className="py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground">صفحه اصلی</a>
            <span>/</span>
            <a href="#" className="hover:text-foreground">اخبار</a>
            <span>/</span>
            <span className="text-foreground">{mockArticle.category}</span>
          </nav>

          {/* Article Header */}
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">{mockArticle.category}</span>
            <h1 className="mt-3 text-display-lg text-foreground">{mockArticle.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="size-4" aria-hidden />{mockArticle.author}</span>
              <span className="flex items-center gap-1.5"><Calendar className="size-4" aria-hidden />{mockArticle.date}</span>
              <span>{mockArticle.readTime}</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img src={mockArticle.image || '/placeholder.svg'} alt={mockArticle.title} className="w-full object-cover" />
          </div>

          {/* Actions */}
          <div className="mb-8 flex items-center gap-2">
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              <Share2 className="size-3.5" aria-hidden />
              اشتراک‌گذاری
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              <Bookmark className="size-3.5" aria-hidden />
              ذخیره
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              <Printer className="size-3.5" aria-hidden />
              چاپ
            </button>
          </div>

          {/* Content */}
          <div
            className="prose prose-sm max-w-none text-foreground prose-headings:font-bold prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: mockArticle.content }}
          />

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {mockArticle.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">#{tag}</span>
            ))}
          </div>

          {/* Back */}
          <div className="mt-8">
            <a href="/" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              <ArrowRight className="size-4" aria-hidden />
              بازگشت به صفحه اصلی
            </a>
          </div>
        </article>
      </Container>

      <PortalFooter />
    </div>
  )
}
