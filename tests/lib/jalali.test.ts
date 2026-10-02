import { describe, it, expect } from 'vitest'
import {
  formatJalali,
  formatJalaliDateTime,
  formatRelativeTime,
  getDayOfWeek,
  getMonthName,
  gregorianToJalali,
  formatJalaliDate,
  getCurrentJalali,
} from '@/lib/jalali'

describe('Jalali Date Utilities', () => {
  describe('formatJalali', () => {
    it('formats Date to Jalali string', () => {
      const date = new Date(2024, 2, 21) // March 21, 2024 (Nowruz)
      const result = formatJalali(date)
      expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/)
    })

    it('formats string date to Jalali', () => {
      const result = formatJalali('2024-03-21')
      expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/)
    })

    it('accepts custom format', () => {
      const date = new Date(2024, 2, 21)
      const result = formatJalali(date, 'yyyy-MM-dd')
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('formatJalaliDateTime', () => {
    it('formats date with time', () => {
      const date = new Date(2024, 2, 21, 14, 30)
      const result = formatJalaliDateTime(date)
      expect(result).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)
    })
  })

  describe('formatRelativeTime', () => {
    it('shows "همین الان" for very recent dates', () => {
      const now = new Date()
      const result = formatRelativeTime(now)
      expect(result).toBe('همین الان')
    })

    it('shows minutes for recent dates', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      const result = formatRelativeTime(date)
      expect(result).toContain('دقیقه پیش')
    })

    it('shows hours for same day', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      const result = formatRelativeTime(date)
      expect(result).toContain('ساعت پیش')
    })

    it('shows days for recent dates', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      const result = formatRelativeTime(date)
      expect(result).toContain('روز پیش')
    })

    it('shows formatted date for older dates', () => {
      const date = new Date(2024, 0, 1) // January 1, 2024
      const result = formatRelativeTime(date)
      expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/)
    })
  })

  describe('getDayOfWeek', () => {
    it('returns Persian day name', () => {
      const saturday = new Date(2024, 2, 23) // Saturday
      const result = getDayOfWeek(saturday)
      expect(result).toBe('شنبه')
    })

    it('handles string dates', () => {
      const result = getDayOfWeek('2024-03-23')
      expect(['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']).toContain(
        result
      )
    })
  })

  describe('getMonthName', () => {
    it('returns Persian month name', () => {
      const date = new Date(2024, 2, 21) // March (should map to a Persian month)
      const result = getMonthName(date)
      expect([
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
      ]).toContain(result)
    })
  })

  describe('gregorianToJalali', () => {
    it('converts Gregorian to Jalali', () => {
      const date = new Date(2024, 2, 21) // March 21, 2024 (Nowruz)
      const result = gregorianToJalali(date)
      expect(result.year).toBe(1403)
      expect(result.month).toBe(1)
      expect(result.day).toBe(1)
    })

    it('handles different dates', () => {
      const date = new Date(2024, 5, 22) // June 22, 2024
      const result = gregorianToJalali(date)
      expect(result.year).toBe(1403)
      expect(result.month).toBeGreaterThan(1)
    })
  })

  describe('formatJalaliDate', () => {
    it('formats Jalali date object to Persian string', () => {
      const jalali = { year: 1403, month: 1, day: 1 }
      const result = formatJalaliDate(jalali)
      expect(result).toBe('1 فروردین 1403')
    })

    it('handles different months', () => {
      const jalali = { year: 1403, month: 5, day: 15 }
      const result = formatJalaliDate(jalali)
      expect(result).toContain('15')
      expect(result).toContain('1403')
    })
  })

  describe('getCurrentJalali', () => {
    it('returns current Jalali date', () => {
      const result = getCurrentJalali()
      expect(result).toHaveProperty('year')
      expect(result).toHaveProperty('month')
      expect(result).toHaveProperty('day')
      expect(result.year).toBeGreaterThan(1400)
      expect(result.month).toBeGreaterThanOrEqual(1)
      expect(result.month).toBeLessThanOrEqual(12)
      expect(result.day).toBeGreaterThanOrEqual(1)
      expect(result.day).toBeLessThanOrEqual(31)
    })
  })
})
