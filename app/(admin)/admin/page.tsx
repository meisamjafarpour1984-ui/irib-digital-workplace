import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'

export const metadata = {
  title: 'کنسول مدیریت | پرتال دیجیتال کارکنان',
  description: 'مدیریت ساختار سایت، کاربران، نقش‌ها و تنظیمات پلتفرم',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-display-lg text-foreground">کنسول مدیریت</h1>
            <p className="mt-2 text-body-lg text-muted-foreground">
              مدیریت ساختار سایت، کاربران، نقش‌ها و تنظیمات پلتفرم
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="/admin/pages"
                className="rounded-xl border border-border p-6 transition-colors hover:border-brand/50 hover:shadow-sm"
              >
                <h3 className="text-heading-1 text-foreground">سازنده صفحه</h3>
                <p className="mt-1 text-sm text-muted-foreground">طراحی و ویرایش صفحات با Drag & Drop</p>
              </a>
              <a
                href="/admin/themes"
                className="rounded-xl border border-border p-6 transition-colors hover:border-brand/50 hover:shadow-sm"
              >
                <h3 className="text-heading-1 text-foreground">مدیریت پوسته</h3>
                <p className="mt-1 text-sm text-muted-foreground">ویرایش توکن‌ها و تم‌های مناسبتی</p>
              </a>
              <a
                href="/admin/rbac"
                className="rounded-xl border border-border p-6 transition-colors hover:border-brand/50 hover:shadow-sm"
              >
                <h3 className="text-heading-1 text-foreground">مدیریت دسترسی‌ها</h3>
                <p className="mt-1 text-sm text-muted-foreground">تعریف نقش‌ها و ماتریس مجوزها</p>
              </a>
              <a
                href="/admin/org-chart"
                className="rounded-xl border border-border p-6 transition-colors hover:border-brand/50 hover:shadow-sm"
              >
                <h3 className="text-heading-1 text-foreground">نمودار سازمانی</h3>
                <p className="mt-1 text-sm text-muted-foreground">مدیریت درختی ساختار سازمان</p>
              </a>
              <a
                href="/admin/storage"
                className="rounded-xl border border-border p-6 transition-colors hover:border-brand/50 hover:shadow-sm"
              >
                <h3 className="text-heading-1 text-foreground">مدیریت استوریج</h3>
                <p className="mt-1 text-sm text-muted-foreground">پیکربندی ذخیره‌سازی فایل‌ها</p>
              </a>
              <a
                href="/admin/audit"
                className="rounded-xl border border-border p-6 transition-colors hover:border-brand/50 hover:shadow-sm"
              >
                <h3 className="text-heading-1 text-foreground">لاگ فعالیت‌ها</h3>
                <p className="mt-1 text-sm text-muted-foreground">مشاهده و خروجی فعالیت‌های سیستم</p>
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
