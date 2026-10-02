/**
 * IRIB Digital Workplace Platform - Workspaces Dashboard Layout
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مدیریت کارتابل‌ها | داشبورد مدیریتی',
  description: 'مدیریت کارتابل‌ها و فضاهای کاری سازمانی',
}

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
