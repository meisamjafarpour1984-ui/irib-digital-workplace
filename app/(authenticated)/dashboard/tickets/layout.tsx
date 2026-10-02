/**
 * IRIB Digital Workplace Platform - Tickets Dashboard Layout
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مدیریت تیکت‌ها | داشبورد مدیریتی',
  description: 'مدیریت تیکت‌های پشتیبانی و خدمات',
}

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
