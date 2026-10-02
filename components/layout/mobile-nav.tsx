'use client'

import { usePathname } from 'next/navigation'
import { Home, Inbox, Grid3x3, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const navItemIds = [
  { href: '/', icon: Home, id: 'home' },
  { href: '/dashboard/inbox', icon: Inbox, id: 'inbox' },
  { href: '/dashboard/forms/builder', icon: Plus, id: 'create', isAction: true },
  { href: '/departments/it', icon: Grid3x3, id: 'services' },
  { href: '/dashboard', icon: User, id: 'profile' },
]

export function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations('mobileNav')

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      aria-label={t('ariaLabel')}
    >
      <ul className="flex items-center justify-around px-2 py-1">
        {navItemIds.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const label = t(`items.${item.id}`)

          if (item.isAction) {
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex size-12 -translate-y-4 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 active:scale-95"
                  aria-label={label}
                >
                  <Icon className="size-6" aria-hidden />
                </a>
              </li>
            )
          }

          return (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors min-h-[44px] min-w-[44px] justify-center',
                  isActive ? 'text-brand' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-5" aria-hidden />
                <span>{label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
