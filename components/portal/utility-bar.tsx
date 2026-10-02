'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { CalendarDays, LayoutDashboard, Search, Sun, LogIn, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'

export function UtilityBar() {
  const router = useRouter()
  const t = useTranslations('utilityBar')
  const tAuth = useTranslations('auth')
  const tNav = useTranslations('nav')
  const { user, token, clearSession } = useAuthStore()

  // Check if user has admin/management roles
  const hasManagementRole = user?.roles?.some((role) =>
    ['ADMIN', 'EDITOR', 'MANAGER'].includes(role.code)
  )

  const handleLogin = () => {
    router.push('/login')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    clearSession()
    router.push('/')
  }

  return (
    <div className="border-b border-border bg-card/60">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-2 md:px-6">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
            ح.ک
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">{t('greeting')}</p>
            <p className="text-xs text-muted-foreground">{t('welcome')}</p>
          </div>
        </div>

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        {/* Date */}
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <CalendarDays className="size-4 text-brand" aria-hidden />
          <div className="leading-tight">
            <p className="font-medium text-foreground">شنبه ۱۲ خرداد ۱۴۰۴</p>
            <p>۲۳ ذی‌القعده ۱۴۴۶</p>
          </div>
        </div>

        {/* Weather */}
        <div className="hidden items-center gap-2 text-xs sm:flex">
          <Sun className="size-4 text-gold" aria-hidden />
          <span className="font-medium text-foreground">۱۰:۴۲</span>
          <span className="text-muted-foreground">۲۳°C</span>
        </div>

        {/* Spacer to push search to the right */}
        <div className="flex-1" />

        {/* Auth buttons */}
        {!token || !user ? (
          <button
            type="button"
            onClick={handleLogin}
            className="hidden items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-brand-hover sm:flex"
          >
            <LogIn className="size-4" aria-hidden />
            {tAuth('login')}
          </button>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            {hasManagementRole && (
              <Link
                href="/dashboard"
                className="items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                <LayoutDashboard className="size-4" aria-hidden />
                {tNav('dashboard')}
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="size-4" aria-hidden />
              {tAuth('logout')}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="w-full sm:w-auto sm:min-w-72 md:min-w-96">
          <div className="relative">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchLabel')}
              className="h-9 w-full rounded-lg border border-input bg-background pe-9 ps-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
