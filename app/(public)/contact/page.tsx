/**
 * IRIB Digital Workplace Platform - Contact Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Phone, Mail, MapPin, Clock, ArrowLeft, Send, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'تماس با ما | درگاه دیجیتال کارکنان',
  description: 'اطلاعات تماس و ارتباط با مرکز صدا و سیمای آذربایجان شرقی',
}

const contactInfo = [
  {
    icon: Phone,
    label: 'تلفن',
    value: '۰۴۱-۳۳۳۳۴۴۴۴',
  },
  {
    icon: Mail,
    label: 'ایمیل',
    value: 'info@irib-azarbaijan.ir',
  },
  {
    icon: MapPin,
    label: 'آدرس',
    value: 'تبریز، خیابان ارم، مرکز صدا و سیمای آذربایجان شرقی',
  },
  {
    icon: Clock,
    label: 'ساعات کاری',
    value: 'شنبه تا پنجشنبه: ۸:۰۰ تا ۱۶:۰۰',
  },
]

const departments = [
  { name: 'مدیریت مرکز', phone: '۰۴۱-۳۳۳۳۴۴۴۴', email: 'management@irib-azarbaijan.ir' },
  { name: 'معاونت تولید', phone: '۰۴۱-۳۳۳۳۵۵۵۵', email: 'production@irib-azarbaijan.ir' },
  { name: 'معاونت فناوری اطلاعات', phone: '۰۴۱-۳۳۳۳۶۶۶۶', email: 'it@irib-azarbaijan.ir' },
  { name: 'معاونت پژوهش', phone: '۰۴۱-۳۳۳۳۷۷۷۷', email: 'research@irib-azarbaijan.ir' },
  { name: 'واحد اداری', phone: '۰۴۱-۳۳۳۳۸۸۸۸', email: 'admin@irib-azarbaijan.ir' },
  { name: 'واحد پشتیبانی', phone: '۰۴۱-۳۳۳۳۹۹۹۹', email: 'support@irib-azarbaijan.ir' },
]

export default function ContactPage() {
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
          <h1 className="text-heading-1 text-foreground">تماس با ما</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            برای ارتباط با مرکز صدا و سیمای آذربایجان شرقی از اطلاعات زیر استفاده کنید
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-heading-1 text-foreground">اطلاعات تماس</h2>
              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon
                  return (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{info.label}</p>
                        <p className="text-sm text-muted-foreground">{info.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-heading-1 text-foreground">اطلاعات واحدها</h2>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.phone}</p>
                    </div>
                    <a href={`mailto:${dept.email}`} className="text-sm text-brand hover:underline">
                      ارسال ایمیل
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-heading-1 text-foreground">ارسال پیام</h2>
            <form className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">ایمیل</label>
                <input
                  type="email"
                  placeholder="ایمیل خود را وارد کنید"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">واحد</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none">
                  <option value="">انتخاب واحد</option>
                  {departments.map((dept) => (
                    <option key={dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">موضوع</label>
                <input
                  type="text"
                  placeholder="موضوع پیام"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">پیام</label>
                <textarea
                  rows={5}
                  placeholder="پیام خود را بنویسید..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand/90"
              >
                <Send className="size-4" />
                ارسال پیام
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            href="/dashboard/tickets"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">ثبت تیکت</p>
              <p className="text-xs text-muted-foreground">برای مشکلات فنی</p>
            </div>
          </a>
          <a
            href="/experts"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Phone className="size-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">پشتیبانی تلفنی</p>
              <p className="text-xs text-muted-foreground">شنبه تا پنجشنبه</p>
            </div>
          </a>
          <a
            href="/help"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">راهنمای کاربران</p>
              <p className="text-xs text-muted-foreground">سوالات متداول</p>
            </div>
          </a>
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
