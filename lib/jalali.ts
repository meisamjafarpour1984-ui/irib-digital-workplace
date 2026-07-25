/**
 * Jalali (Persian/Solar Hijri) date utilities
 * Uses date-fns-jalali for conversion
 */

import { format, parse } from 'date-fns-jalali'

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
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ]
  // Simple approximation for month display
  return months[d.getMonth()]
}

/**
 * Convert Gregorian to Jalali (approximate)
 */
export function gregorianToJalali(date: Date): { year: number; month: number; day: number } {
  const gy = date.getFullYear()
  const gm = date.getMonth() + 1
  const gd = date.getDate()

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const gy2 = gm > 2 ? gy + 1 : gy
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1]
  let jy = -1595 + (33 * Math.floor(days / 12053))
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let jm: number
  let jd: number
  if (days < 186) {
    jm = 1 + Math.floor(days / 31)
    jd = 1 + (days % 31)
  } else {
    jm = 7 + Math.floor((days - 186) / 30)
    jd = 1 + ((days - 186) % 30)
  }

  return { year: jy, month: jm, day: jd }
}

/**
 * Format Jalali date object to string
 */
export function formatJalaliDate(jalali: { year: number; month: number; day: number }): string {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ]
  return `${jalali.day} ${months[jalali.month - 1]} ${jalali.year}`
}

/**
 * Get current Jalali date
 */
export function getCurrentJalali(): { year: number; month: number; day: number } {
  return gregorianToJalali(new Date())
}
