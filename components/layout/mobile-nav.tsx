'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { sidebarItems } from '@/lib/dashboard-data'

const primaryHrefs = ['/dashboard', '/dashboard/inbox', '/dashboard/forms', '/dashboard/tickets']

export function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations('mobileNav')
  const tAccessibility = useTranslations('accessibility')
  const [open, setOpen] = useState(false)
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
  const moreItems = sidebarItems.filter((item) => !primaryHrefs.includes(item.href ?? ''))

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={tAccessibility('closeMenu')}
            className="absolute inset-0 bg-black/30"
          />
          <nav
            id="dashboard-mobile-menu"
            aria-label={t('ariaLabel')}
            className="absolute inset-x-0 bottom-16 z-10 max-h-[min(65dvh,34rem)] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between border-b border-border px-2 pb-3">
              <p className="text-sm font-semibold text-foreground">{t('more')}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={tAccessibility('closeMenu')}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {moreItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href === activeHref
                return (
                  <li key={item.href ?? item.label}>
                    <Link
                      href={item.href ?? '/dashboard'}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        isActive
                          ? 'bg-brand-light text-brand'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden"
        aria-label={t('ariaLabel')}
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1">
          {primaryHrefs.map((href) => {
            const item = sidebarItems.find((candidate) => candidate.href === href)
            if (!item) return null
            const Icon = item.icon
            const isActive = item.href === activeHref
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                    isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-5" aria-hidden />
                  <span>{href === '/dashboard/inbox' ? t('items.inbox') : item.label}</span>
                </Link>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={open ? 'dashboard-mobile-menu' : undefined}
              className={`flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                open || moreItems.some((item) => item.href === activeHref)
                  ? 'text-brand'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {open ? <ChevronDown className="size-5" aria-hidden /> : <ChevronUp className="size-5" aria-hidden />}
              <span>{t('more')}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
