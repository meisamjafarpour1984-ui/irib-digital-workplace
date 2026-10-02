'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { navItems } from '@/lib/portal-data'
import { PortalLogo } from './portal-logo'

interface PortalHeaderProps {
  authButton?: React.ReactNode
}

export function PortalHeader({ authButton }: PortalHeaderProps) {
  const t = useTranslations('accessibility')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  let activeIndex = -1
  let activeHrefLength = -1

  navItems.forEach((item, index) => {
    const matchesPath = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
    if (matchesPath && item.href.length >= activeHrefLength) {
      activeIndex = index
      activeHrefLength = item.href.length
    }
  })

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <PortalLogo />

        <nav aria-label={t('mainNav')} className="hidden min-w-0 xl:block">
          <ul className="flex items-center gap-0.5">
            {navItems.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <li key={`${item.href}-${item.label}`}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      isActive
                        ? 'bg-brand-light/70 text-brand'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {authButton}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="portal-mobile-navigation"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            className="flex size-11 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="portal-mobile-navigation"
          aria-label={t('mobileNav')}
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border bg-card xl:hidden"
        >
          <ul className="mx-auto max-w-[1440px] space-y-1 px-4 py-3 md:px-6">
            {navItems.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <li key={`${item.href}-${item.label}`}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      isActive ? 'bg-brand-light text-brand' : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
