'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Radio } from 'lucide-react'
import { sidebarItems } from '@/lib/dashboard-data'

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations('sidebar')
  const activeHref = sidebarItems
    .filter((item) => {
      if (!item.href) return false
      if (item.href === '/dashboard') return pathname === item.href
      return pathname === item.href || pathname.startsWith(`${item.href}/`)
    })
    .reduce<string | undefined>((current, item) =>
      item.href && item.href.length > (current?.length ?? 0) ? item.href : current,
      undefined
    )

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy text-white lg:flex">
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
            const isActive = item.href === activeHref
            return (
              <li key={item.label}>
                <Link
                  href={item.href || '#'}
                  className={`flex min-h-11 items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isActive
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4.5 shrink-0" aria-hidden />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand/20 text-brand-light'
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
          className="flex min-h-11 items-center justify-center rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t('backToPortal')}
        </Link>
      </div>
    </aside>
  )
}
