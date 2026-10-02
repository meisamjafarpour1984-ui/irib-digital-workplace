/**
 * Jalali (Persian/Solar Hijri) date utilities
 * Uses date-fns-jalali for conversion
 */

import { format } from 'date-fns-jalali'

/**
 * Format a Date to Jalali string
 */
export function formatJalali(date: Date | string, formatStr: string = 'yyyy/MM/dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr)
}

/**
 * Format with time
 */
export function formatJalaliDateTime(date: Date | string): string {
  return formatJalali(date, 'yyyy/MM/dd HH:mm')
}

/**
 * Format relative time in Persian
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'همین الان'
  if (diffMin < 60) return `${diffMin} دقیقه پیش`
  if (diffHour < 24) return `${diffHour} ساعت پیش`
  if (diffDay < 7) return `${diffDay} روز پیش`
  return formatJalali(d)
}

/**
 * Get day of week in Persian
 */
export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
  return days[d.getDay()]
}

/**
 * Get month name in Persian
 */
export function getMonthName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ]
  // Simple approximation for month display
  return months[d.getMonth()]
}

/**
 * Convert Gregorian to Jalali (approximate)
 */
export function gregorianToJalali(date: Date): { year: number; month: number; day: number } {
  const normalizedDate = new Date(date)
  normalizedDate.setDate(normalizedDate.getDate() - 1)
  const [year, month, day] = format(normalizedDate, 'yyyy/M/d').split('/').map(Number)
  return { year, month, day }
}

/**
 * Format Jalali date object to string
 */
export function formatJalaliDate(jalali: { year: number; month: number; day: number }): string {
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ]
  return `${jalali.day} ${months[jalali.month - 1]} ${jalali.year}`
}

/**
 * Get current Jalali date
 */
export function getCurrentJalali(): { year: number; month: number; day: number } {
  return gregorianToJalali(new Date())
}
