'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isStandalonePreview = pathname.replace(/\/$/, '').endsWith('/dashboard/content/preview')

  if (isStandalonePreview) return children

  return <DashboardShell>{children}</DashboardShell>
}
