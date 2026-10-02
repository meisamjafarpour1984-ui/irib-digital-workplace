/**
 * IRIB Digital Workplace Platform - Help & FAQ Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  MessageSquare,
  ArrowLeft as ArrowIcon,
} from 'lucide-react'

const faqCategories = [
  { id: 'general', label: 'عمومی', count: 8 },
  { id: 'authentication', label: 'احراز هویت', count: 5 },
  { id: 'content', label: 'مدیریت محتوا', count: 7 },
  { id: 'tickets', label: 'تیکت‌ها', count: 4 },
  { id: 'mobile', label: 'موبایل', count: 3 },
]

const faqs = [
  {
    id: 1,
    category: 'general',
    question: 'چگونه به درگاه دسترسی پیدا کنم؟',
    answer:
      'برای دسترسی به درگاه، کد پرسنلی و رمز عبور خود را وارد کنید. اگر رمز عبور ندارید، از گزینه "فراموشی رمز عبور" استفاده کنید.',
  },
  {
    id: 2,
    category: 'general',
    question: 'چگونه رمز عبور خود را تغییر دهم؟',
    answer:
      'از بخش تنظیمات در داشبورد، گزینه "تغییر رمز عبور" را انتخاب کنید و رمز جدید خود را وارد کنید.',
  },
  {
    id: 3,
    category: 'authentication',
    question: 'چگونه با موبایل وارد شوم؟',
    answer:
      'برای ورود با موبایل، به صفحه /mobile/welcome بروید و کد پرسنلی و شماره موبایل خود را وارد کنید. کد OTP به موبایل شما ارسال می‌شود.',
  },
  {
    id: 4,
    category: 'authentication',
    question: 'کد OTP دریافت نکردم چه کنم؟',
    answer:
      'اگر کد OTP دریافت نکردید، از گزینه "ارسال مجدد" استفاده کنید. همچنین مطمئن شوید شماره موبایل درست وارد شده است.',
  },
  {
    id: 5,
    category: 'content',
    question: 'چگونه محتوای جدید ایجاد کنم؟',
    answer:
      'از داشبورد، به بخش "محتوا" بروید و روی دکمه "ایجاد محتوا" کلیک کنید. سپس اطلاعات محتوا را پر کنید و ذخیره کنید.',
  },
  {
    id: 6,
    category: 'content',
    question: 'چگونه محتوا را منتشر کنم؟',
    answer:
      'پس از ایجاد محتوا، در حالت پیش‌نویس قرار می‌گیرد. برای انتشار، دکمه "انتشار" را کلیک کنید و محتوا پس از تأیید منتشر می‌شود.',
  },
  {
    id: 7,
    category: 'tickets',
    question: 'چگونه تیکت جدید ایجاد کنم؟',
    answer:
      'از داشبورد، به بخش "تیکت‌ها" بروید و روی دکمه "ایجاد تیکت" کلیک کنید. عنوان، توضیحات و دسته‌بندی تیکت را مشخص کنید.',
  },
  {
    id: 8,
    category: 'mobile',
    question: 'چگونه دستگاه موبایل خود را ثبت کنم؟',
    answer:
      'از صفحه /mobile/register وارد شوید و کد پرسنلی و شماره موبایل خود را وارد کنید. پس از تأیید OTP، دستگاه شما ثبت می‌شود.',
  },
]

const guides = [
  {
    id: 1,
    title: 'راهنمای استفاده از داشبورد',
    description: 'آموزش کامل استفاده از داشبورد مدیریتی',
    type: 'article',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'راهنمای مدیریت محتوا',
    description: 'نحوه ایجاد، ویرایش و انتشار محتوا',
    type: 'video',
    icon: Video,
  },
  {
    id: 3,
    title: 'راهنمای تیکتینگ',
    description: 'نحوه ایجاد و پیگیری تیکت‌ها',
    type: 'article',
    icon: FileText,
  },
  {
    id: 4,
    title: 'راهنمای موبایل',
    description: 'نحوه استفاده از اپلیکیشن موبایل',
    type: 'video',
    icon: Video,
  },
]

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const filteredFaqs =
    activeCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === activeCategory)

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
          <h1 className="text-heading-1 text-foreground">راهنمای کاربران</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            سوالات متداول و راهنمای استفاده از درگاه
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو در راهنما..."
              className="w-full rounded-xl border border-border bg-background pr-12 pl-4 py-3 text-base text-foreground focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="mb-4 text-heading-1 text-foreground">سوالات متداول</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-brand text-white'
                      : 'bg-accent text-foreground hover:bg-muted'
                  }`}
                >
                  همه ({faqs.length})
                </button>
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-brand text-white'
                        : 'bg-accent text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between p-4 text-right hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-foreground">{faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guides Section */}
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-heading-1 text-foreground">راهنماها</h2>
            <div className="space-y-3">
              {guides.map((guide) => {
                const Icon = guide.icon
                return (
                  <div
                    key={guide.id}
                    className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand mb-3">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                    <button className="flex items-center gap-2 text-sm text-brand hover:underline">
                      مشاهده
                      <ArrowIcon className="size-3" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Contact Support */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <MessageSquare className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">نیاز به کمک دارید؟</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                اگر پاسخ سوال خود را پیدا نکردید، با پشتیبانی تماس بگیرید.
              </p>
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                تماس با پشتیبانی
              </a>
            </div>
          </div>
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
