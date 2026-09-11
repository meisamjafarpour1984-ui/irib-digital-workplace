/**
 * i18n configuration for Persian locale
 * Uses next-intl for ICU MessageFormat support
 */

import { getRequestConfig } from 'next-intl/server'

export const locales = ['fa'] as const
export const defaultLocale = 'fa' as const

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}))
