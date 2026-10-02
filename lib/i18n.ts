/**
 * i18n configuration for Persian locale
 * Uses next-intl for ICU MessageFormat support
 */

import { getRequestConfig } from 'next-intl/server'

export const locales = ['fa'] as const
export const defaultLocale = 'fa' as const

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  const messages = (await import(`../messages/${locale ?? defaultLocale}.json`)).default
  const announcements = messages.announcements ?? {}
  const pages = messages.pages ?? announcements.pages ?? {}
  const users = messages.users ?? announcements.users ?? {}
  const workspaces = messages.workspaces ?? announcements.workspaces ?? {}
  const adminSettings = messages.admin?.settings ?? {
    title: 'تنظیمات سیستم',
    subtitle: 'مدیریت تنظیمات و پیکربندی سیستم',
    saveAll: 'ذخیره همه',
    locked: 'قفل شده',
    noSettings: 'هیچ تنظیمی در این دسته وجود ندارد',
    categories: {
      authentication: 'احراز هویت',
      sms: 'پیامک',
      email: 'ایمیل',
      notification: 'اعلان',
      storage: 'ذخیره‌سازی',
      integration: 'یکپارچه‌سازی',
      general: 'عمومی',
    },
  }

  return {
    locale: locale ?? defaultLocale,
    messages: {
      ...messages,
      pages,
      users,
      workspaces,
      admin: { ...messages.admin, settings: adminSettings },
      authButton: messages.authButton ?? {
        login: 'ورود',
        logout: 'خروج',
        dashboard: 'داشبورد',
        profile: 'پروفایل',
      },
      widgets: {
        ...messages.widgets,
        heroMedia: {
          ...messages.widgets?.heroMedia,
          carouselLabel: messages.widgets?.heroMedia?.carouselLabel ?? 'اسلاید رسانه‌ای',
        },
      },
    },
  }
})
