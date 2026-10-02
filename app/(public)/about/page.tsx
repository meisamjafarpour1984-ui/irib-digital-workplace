/**
 * IRIB Digital Workplace Platform - About Page
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
import { Building2, Users, Award, Target, ArrowLeft, Radio, Tv } from 'lucide-react'

export const metadata = {
  title: 'درباره ما | درگاه دیجیتال کارکنان',
  description: 'درباره مرکز صدا و سیمای آذربایجان شرقی',
}

const stats = [
  { label: 'سال تأسیس', value: '۱۳۷۰' },
  { label: 'کارکنان', value: '۲۰۰+' },
  { label: 'برنامه‌های رادیویی', value: '۵۰+' },
  { label: 'برنامه‌های تلویزیونی', value: '۳۰+' },
]

const values = [
  {
    icon: Award,
    title: 'کیفیت و تعالی',
    description: 'تعه‌د به تولید محتوای با کیفیت و ارتقای مستمر سطح کار',
  },
  {
    icon: Users,
    title: 'کاربر محوری',
    description: 'تمرکز بر نیازهای مخاطبان و ارائه خدمات بهتر',
  },
  {
    icon: Target,
    title: 'نوآوری',
    description: 'پذیرش فناوری‌های جدید و تحول دیجیتال',
  },
]

export default function AboutPage() {
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

        {/* Hero Section */}
        <div className="mb-12 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand/10">
            <Building2 className="size-10 text-brand" />
          </div>
          <h1 className="mt-6 text-heading-1 text-foreground">
            درباره مرکز صدا و سیمای آذربایجان شرقی
          </h1>
          <p className="mt-3 text-body-lg text-muted-foreground max-w-2xl mx-auto">
            مرکز صدا و سیمای آذربایجان شرقی با بیش از نیم قرن تجربه در تولید محتوای رادیویی و
            تلویزیونی، یکی از پیشروترین مراکز رسانه‌ای کشور است.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <p className="text-3xl font-bold text-brand">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="size-6 text-brand" />
              <h2 className="text-heading-1 text-foreground">مأموریت</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              تولید و پخش محتوای رادیویی و تلویزیونی با کیفیت برای ارتقای فرهنگ و هنر اسلامی-ایرانی،
              ارائه خدمات خبری و اطلاع‌رسانی دقیق و به‌موقع، و حفظ و گسترش ارزش‌های ملی و اسلامی.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Tv className="size-6 text-brand" />
              <h2 className="text-heading-1 text-foreground">چشم‌انداز</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              تبدیل شدن به مرکز پیشرو در تولید محتوای دیجیتال و نوآوری در رسانه، با تمرکز بر استفاده
              از فناوری‌های جدید و تحول دیجیتال برای ارائه خدمات بهتر به مخاطبان.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="mb-6 text-heading-1 text-foreground">ارزش‌های ما</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand mb-4">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Organization Structure */}
        <div className="mb-12">
          <h2 className="mb-6 text-heading-1 text-foreground">ساختار سازمانی</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-accent">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">مدیریت مرکز</h3>
                  <p className="text-sm text-muted-foreground">مدیریت کل و راهبری استراتژیک</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue/10 text-blue">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">معاونت تولید</h4>
                    <p className="text-xs text-muted-foreground">برنامه‌های تلویزیونی و رادیویی</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green/10 text-green">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">معاونت فناوری اطلاعات</h4>
                    <p className="text-xs text-muted-foreground">زیرساخت و سیستم‌ها</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-purple/10 text-purple">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">معاونت پژوهش</h4>
                    <p className="text-xs text-muted-foreground">تحقیق و توسعه</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
