# راهنمای سیستم ویجت — IRIB DWP

---

## ⚠️ مهم: این مستند برای کدام نسخه است؟

این مستند برای **نسخه کامل زیرساختی (backend/docker-compose.db.yml)** نوشته شده است.

### نسخه‌های پروژه

- **نسخه توسعه ساده (docker-compose.dev.yml):** 4 سرویس (frontend, backend, postgres, redis)
  - مناسب برای: توسعه روزمره با hot-reload
  - دسترسی: `docker-compose -f docker-compose.dev.yml up`

- **نسخه کامل زیرساختی (backend/docker-compose.db.yml):** 11+ سرویس
  - مناسب برای: توسعه کامل با تمام زیرساخت‌ها
  - دسترسی: `docker-compose -f backend/docker-compose.db.yml up`

### این مستند برای کدام نسخه است؟

✅ **نسخه کامل زیرساختی (db.yml)** - این مستند برای این نسخه است
❌ **نسخه توسعه ساده (dev.yml)** - این مستند برای این نسخه نیست

### اگر از نسخه توسعه ساده استفاده می‌کنید:

لطفاً به مستندات زیر مراجعه کنید:
- [README.md](./README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## مفاهیم پایه

### ویجت چیست؟

ویجت یک **کامپوننت مستقل و قابل ترکیب** است که در صفحات مختلف استفاده می‌شود. هر ویجت:

- **مستقل است:** به تنهایی کار می‌کند
- **قابل تنظیم است:** از طریق `config` پیکربندی می‌شود
- **مجوز-محور است:** بر اساس دسترسی کاربر نمایش داده می‌شود
- **پاسخگو است:** در موبایل و دسکتاپ درست نمایش داده می‌شود

### ساختار یک ویجت

```
components/widgets/
├── types.ts                 ← تعریف نوع‌ها
├── widget-registry.ts       ← رجیستری
├── widget-renderer.tsx      ← رندرر
├── widget-skeleton.tsx      ← اسکلتون بارگذاری
├── manifest.ts              ← ثبت ویجت‌ها
├── hero-media.tsx           ← نمونه ویجت
└── ...
```

---

## مراحل ساخت ویجت

### مرحله ۱: ایجاد فایل ویجت

```tsx
// components/widgets/my-widget.tsx
'use client'

import type { WidgetProps } from './types'

export function MyWidget({ instance, config }: WidgetProps) {
  // خواندن تنظیمات
  const limit = (config?.limit as number) ?? 5

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* هدر */}
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">عنوان ویجت</h2>
        </div>
      </div>

      {/* محتوا */}
      <div className="space-y-2">{/* لیست آیتم‌ها */}</div>
    </div>
  )
}
```

### مرحله ۲: ثبت در مانیفست

```tsx
// components/widgets/manifest.ts
import { MyWidget } from './my-widget'

// اضافه کردن به آرایه manifests
{
  manifest: {
    id: 'my-widget',
    name: 'ویجت من',
    category: 'Custom',           // Hero, Content, Navigation, Admin, Department, Utility
    description: 'توضیحات ویجت',
    defaultSize: { cols: 6, rows: 4 },  // اندازه پیش‌فرض در گرید ۱۲ ستونه
    resizable: true,              // قابل تغییر اندازه
    draggable: true,              // قابل جابجایی
    ssr: true,                    // پشتیبانی SSR
    permissions: [],              // مجوزهای مورد نیاز (خالی = عمومی)
  },
  Component: MyWidget,
},
```

### مرحله ۳: استفاده در صفحه

```tsx
// app/(public)/page.tsx
import { WidgetRenderer } from '@/components/widgets/all-widgets'
import type { WidgetInstance } from '@/components/widgets/types'

const widgets: WidgetInstance[] = [
  {
    id: 'w1',
    widgetId: 'my-widget',
    config: { limit: 5 }, // پیکربندی اختصاصی
  },
]

export default function Page() {
  return <WidgetRenderer instances={widgets} />
}
```

---

## انواع ویجت‌ها

| نوع            | کاربرد                 | مثال                                            |
| -------------- | ---------------------- | ----------------------------------------------- |
| **Hero**       | بنر اصلی تمام عرض      | `hero-media`                                    |
| **Content**    | محتوا (اخبار، اطلاعیه) | `news-timeline`, `dept-announcements`           |
| **Navigation** | ناوبری سریع            | `quick-access`                                  |
| **Services**   | سرویس‌ها               | `services-grid`, `it-services`                  |
| **Knowledge**  | دانش و متخصصان         | `research-highlights`, `dept-experts-directory` |
| **Utility**    | ابزارهای کاربردی       | `calendar-prayer`, `weather-tabriz`             |
| **Admin**      | مدیریتی                | `admin-kpi-stats`                               |
| **Department** | اختصاصی واحد           | `dept-document-center`, `dept-forms-center`     |

---

## پیکربندی ویجت

### تعریف configSchema

```tsx
// در manifest.ts
configSchema: z.object({
  limit: z.number().default(5),
  showImage: z.boolean().default(true),
  source: z.enum(['global', 'department']).default('global'),
})
```

### استفاده از config

```tsx
export function MyWidget({ config }: WidgetProps) {
  const limit = (config?.limit as number) ?? 5
  const showImage = (config?.showImage as boolean) ?? true
  const source = (config?.source as string) ?? 'global'

  // ...
}
```

---

## مجوزها

### تعریف مجوز

```tsx
{
  manifest: {
    id: 'admin-kpi',
    permissions: ['Analytics.View.KPI'],  // فقط کاربران با این مجوز
    // ...
  }
}
```

### بررسی مجوز در کامپوننت

```tsx
import { usePermission } from '@/components/providers'

export function MyWidget() {
  const canView = usePermission('Analytics.View.KPI')

  if (!canView) return null // یا نمایش پیام

  return <div>...</div>
}
```

---

## بهترین شیوه‌ها

### ۱. ساختار فایل

```
components/widgets/
├── my-widget.tsx          ← کامپوننت اصلی
├── my-widget.stories.tsx  ← استوری‌بورک
└── my-widget.test.tsx     ← تست
```

### ۲. RTL-First

```tsx
// ✅ درست
<div className="text-right">
  <span className="ms-2">آیکون</span>
</div>

// ❌ غلط
<div className="text-left">
  <span className="mr-2">آیکون</span>
</div>
```

### ۳. استفاده از توکن‌ها

```tsx
// ✅ درست
<div className="bg-card text-foreground border-border">

// ❌ غلط
<div className="bg-white text-gray-900 border-gray-200">
```

### ۴. دسترس‌پذیری

```tsx
// ✅ درست
<button aria-label="حذف">
  <Trash2 className="size-4" aria-hidden />
</button>

// ❌ غلط
<button>
  <Trash2 className="size-4" />
</button>
```

### ۵. واکنش‌گرایی

```tsx
// ✅ درست
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// ❌ غلط
<div className="flex flex-wrap gap-4">
```

### ۶. بارگذاری

```tsx
// ✅ استفاده از Suspense
<Suspense fallback={<WidgetSkeleton />}>
  <MyWidget />
</Suspense>
```

---

## ویجت‌های موجود

| شناسه                      | فایل                         | توضیح              |
| -------------------------- | ---------------------------- | ------------------ |
| `hero-media`               | `hero-media.tsx`             | اسلایدر سینمایی    |
| `quick-access`             | `quick-access.tsx`           | دسترسی سریع        |
| `internet-login`           | `login-card.tsx`             | لاگین سازمانی      |
| `news-timeline`            | `news-timeline.tsx`          | خط زمان اخبار      |
| `dept-announcements`       | `dept-announcements.tsx`     | اطلاعیه‌های تب‌دار |
| `media-gallery`            | `gallery.tsx`                | گالری تصاویر       |
| `it-services`              | `it-info.tsx`                | سرویس‌های IT       |
| `research-highlights`      | `research-highlights.tsx`    | برجسته‌های پژوهش   |
| `calendar-prayer`          | `calendar-prayer.tsx`        | تقویم و اوقات      |
| `weather-tabriz`           | `weather.tsx`                | آب و هوا           |
| `admin-kpi-stats`          | `admin-kpi.tsx`              | KPI مدیریتی        |
| `dept-document-center`     | `dept-document-center.tsx`   | مرکز اسناد         |
| `dept-forms-center`        | `dept-forms-center.tsx`      | مرکز فرم‌ها        |
| `dept-experts-directory`   | `dept-experts-directory.tsx` | فهرست کارشناسان    |
| `dept-service-cards`       | `dept-service-cards.tsx`     | کارت‌های خدمات     |
| `services-grid`            | `services-grid.tsx`          | گرید خدمات         |
| `help-cards`               | `help-cards.tsx`             | کارت‌های راهنما    |
| `dept-announcements-basic` | `announcements.tsx`          | اطلاعیه‌ها         |
| `occasion-banner`          | `occasion-banner.tsx`        | بنر مناسبتی        |
