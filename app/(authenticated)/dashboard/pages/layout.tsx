/**
 * IRIB Digital Workplace Platform - Pages Dashboard Layout
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مدیریت صفحات | داشبورد مدیریتی',
  description: 'مدیریت صفحات استاتیک و داینامیک سیستم',
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
