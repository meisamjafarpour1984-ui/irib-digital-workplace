'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, Bell, Sun, Grid3x3, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'

export function DashboardTopbar() {
  const t = useTranslations('topbar')
  const router = useRouter()
  const { clearSession } = useAuthStore()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    clearSession()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-[4.5rem] items-center justify-between gap-2 border-b border-border bg-card px-3 py-3 sm:gap-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <h1 className="text-base font-bold text-foreground sm:text-lg">{t('title')}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{t('subtitle')}</p>
        </div>
      </div>

      <div className="hidden flex-1 items-center md:flex">
        <div className="relative mx-auto w-full max-w-md">
          <Search
            className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="h-10 w-full rounded-lg border border-input bg-background py-2 pe-10 ps-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('changeTheme')}
        >
          <Sun className="size-4.5" aria-hidden />
        </button>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('systems')}
        >
          <Grid3x3 className="size-4.5" aria-hidden />
        </button>
        <button
          type="button"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('notifications')}
        >
          <Bell className="size-4.5" aria-hidden />
          <span
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error ring-2 ring-card"
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('logout')}
        >
          <LogOut className="size-4.5" aria-hidden />
        </button>
        <div className="ms-1 flex shrink-0 items-center gap-2 border-s border-border ps-2.5 sm:ms-2 sm:gap-2.5 sm:ps-3">
          <div className="hidden leading-tight sm:block sm:text-start">
            <p className="text-sm font-semibold text-foreground">{t('admin')}</p>
            <p className="text-xs text-muted-foreground">{t('userName')}</p>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            ح.ک
          </div>
        </div>
      </div>
    </header>
  )
}
