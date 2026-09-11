# پیاده‌سازی ساده next-intl

## تغییرات انجام شده

### 1. ایجاد فایل messages/fa.json

فایل ترجمه فارسی با تمام پیام‌های سیستم ایجاد شد.

### 2. به‌روزرسانی lib/i18n.ts

```typescript
// قبل: hardcoded messages object
// بعد: dynamic import از messages/fa.json
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}))
```

### 3. ایجاد middleware.ts

```typescript
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

### 4. به‌روزرسانی next.config.mjs

```javascript
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
```

### 5. به‌روزرسانی app/layout.tsx

```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function RootLayout({ children }) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      {/* existing providers */}
    </NextIntlClientProvider>
  )
}
```

## استفاده در Components

```typescript
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  return <button>{t('save')}</button>
}
```

## مراحل بعدی برای تکمیل

1. مهاجرت همه components به useTranslations
2. افزودن locale=en برای پشتیبانی انگلیسی
3. ایجاد tests برای i18n functionality
4. بررسی RTL/LTR layout برای زبان‌های مختلف

## تاریخچه

- 2026-09-11: پیاده‌سازی ساده next-intl با middleware و dynamic imports
