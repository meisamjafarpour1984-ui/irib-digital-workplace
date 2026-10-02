/**
 * IRIB Digital Workplace Platform - Settings Dashboard Layout
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تنظیمات سیستم | داشبورد مدیریتی',
  description: 'مدیریت تنظیمات و پیکربندی سیستم',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
