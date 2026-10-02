/**
 * IRIB Digital Workplace Platform - SMS Dashboard Layout
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مدیریت پیامک | داشبورد مدیریتی',
  description: 'مدیریت سامانه پیامک و کمپین‌های اطلاع‌رسانی',
}

export default function SmsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
