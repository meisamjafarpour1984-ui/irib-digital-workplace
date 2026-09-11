# فعال‌سازی next-intl

## مشکل

next-intl در package.json نصب بود اما استفاده نمی‌شد. سیستم translation ساده دستی پیاده‌سازی شده بود که از قابلیت‌های next-intl استفاده نمی‌کرد.

## راهکار

next-intl را فعال کردم و فایل i18n.ts را به‌روزرسانی کردم.

### تغییرات انجام شده

#### lib/i18n.ts

```typescript
// قبل:
export function t(key: string, locale: Locale = 'fa'): string {
  const keys = key.split('.')
  let value: unknown = messages[locale]
  for (const k of keys) {
    value = (value as Record<string, unknown> | undefined)?.[k]
  }
  return typeof value === 'string' ? value : key
}

// بعد:
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: messages[locale as Locale],
}))
```

## پیاده‌سازی کامل مورد نیاز

برای فعال‌سازی کامل next-intl، مراحل زیر باید انجام شود:

### 1. ایجاد ساختار locales

```
messages/
├── fa.json
└── en.json (optional)
```

### 2. به‌روزرسانی next.config.mjs

```javascript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig = {
  // ... existing config
}

export default withNextIntl(nextConfig)
```

### 3. ایجاد middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './lib/i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

### 4. به‌روزرسانی layout

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return [{ locale: 'fa' }]
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### 5. استفاده در components

```typescript
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  return <button>{t('save')}</button>
}
```

## تأیید فعلی

- ✅ next-intl در package.json نصب است
- ✅ lib/i18n.ts با getRequestConfig به‌روزرسانی شده است
- ⚠️ ساختار کامل next-int هنوز پیاده‌سازی نشده است

## مراحل بعدی

1. ایجاد فایل‌های locale (messages/fa.json)
2. به‌روزرسانی next.config.mjs با next-intl plugin
3. ایجاد middleware برای locale detection
4. بازسازی layout structure برای [locale] routing
5. مهاجرت components به useTranslations hook

## تاریخچه

- 2026-09-11: فعال‌سازی اولیه next-intl با getRequestConfig
