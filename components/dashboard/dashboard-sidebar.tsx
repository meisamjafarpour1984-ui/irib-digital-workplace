'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Radio } from 'lucide-react'
import { sidebarItems } from '@/lib/dashboard-data'

export function DashboardSidebar() {
  const t = useTranslations('sidebar')
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy text-white lg:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
          <Radio className="size-5" aria-hidden />
        </div>
        <div className="text-right leading-tight">
          <p className="text-sm font-bold text-white">{t('systemManagement')}</p>
          <p className="text-xs text-white/55">{t('eastAzerbaijanCenter')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <ul className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <Link
                  href={item.href || '#'}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    item.active
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4.5 shrink-0" aria-hidden />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        item.active ? 'bg-white/20 text-white' : 'bg-brand/20 text-brand-light'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center justify-center rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          {t('backToPortal')}
        </Link>
      </div>
    </aside>
  )
}
