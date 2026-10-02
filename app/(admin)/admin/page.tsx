'use client'

import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Users, FileText, Layers, Activity, Loader2 } from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const { overview, loading, error } = useAnalytics()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6">
            <h1 className="text-display-lg text-foreground">کنسول مدیریت</h1>
            <p className="mt-2 text-body-lg text-muted-foreground">
              مدیریت ساختار سایت، کاربران، نقش‌ها و تنظیمات پلتفرم
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          {overview && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="surface-panel p-4">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-brand" />
                  <span className="text-xs text-muted-foreground">کاربران</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{overview.users.total}</p>
                <p className="text-xs text-muted-foreground">{overview.users.active} فعال</p>
              </div>
              <div className="surface-panel p-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-brand" />
                  <span className="text-xs text-muted-foreground">محتوا</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{overview.content.total}</p>
                <p className="text-xs text-muted-foreground">
                  {overview.content.published} منتشر شده
                </p>
              </div>
              <div className="surface-panel p-4">
                <div className="flex items-center gap-2">
                  <Layers className="size-5 text-brand" />
                  <span className="text-xs text-muted-foreground">فرم‌ها</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{overview.forms.total}</p>
                <p className="text-xs text-muted-foreground">
                  {overview.forms.submissions} ثبت‌نام
                </p>
              </div>
              <div className="surface-panel p-4">
                <div className="flex items-center gap-2">
                  <Activity className="size-5 text-brand" />
                  <span className="text-xs text-muted-foreground">فعالیت</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {overview.activity.auditLogs}
                </p>
                <p className="text-xs text-muted-foreground">لاگ در ۷ روز</p>
              </div>
            </div>
          )}

          <div className="surface-panel p-4 sm:p-6">
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="/admin/pages"
                className="flex min-h-28 flex-col justify-center rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-accent sm:p-5"
              >
                <h3 className="text-heading-1 text-foreground">سازنده صفحه</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  طراحی و ویرایش صفحات با Drag & Drop
                </p>
              </a>
              <a
                href="/admin/themes"
                className="flex min-h-28 flex-col justify-center rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-accent sm:p-5"
              >
                <h3 className="text-heading-1 text-foreground">مدیریت پوسته</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ویرایش توکن‌ها و تم‌های مناسبتی
                </p>
              </a>
              <a
                href="/admin/rbac"
                className="flex min-h-28 flex-col justify-center rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-accent sm:p-5"
              >
                <h3 className="text-heading-1 text-foreground">مدیریت دسترسی‌ها</h3>
                <p className="mt-1 text-sm text-muted-foreground">تعریف نقش‌ها و ماتریس مجوزها</p>
              </a>
              <a
                href="/admin/org-chart"
                className="flex min-h-28 flex-col justify-center rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-accent sm:p-5"
              >
                <h3 className="text-heading-1 text-foreground">نمودار سازمانی</h3>
                <p className="mt-1 text-sm text-muted-foreground">مدیریت درختی ساختار سازمان</p>
              </a>
              <a
                href="/admin/storage"
                className="flex min-h-28 flex-col justify-center rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-accent sm:p-5"
              >
                <h3 className="text-heading-1 text-foreground">مدیریت استوریج</h3>
                <p className="mt-1 text-sm text-muted-foreground">پیکربندی ذخیره‌سازی فایل‌ها</p>
              </a>
              <a
                href="/admin/audit"
                className="flex min-h-28 flex-col justify-center rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-accent sm:p-5"
              >
                <h3 className="text-heading-1 text-foreground">لاگ فعالیت‌ها</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  مشاهده و خروجی فعالیت‌های سیستم
                </p>
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
