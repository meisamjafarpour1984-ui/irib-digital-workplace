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
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-card/80 px-6 py-3.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <h1 className="text-lg font-extrabold text-foreground">{t('title')}</h1>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="hidden flex-1 items-center md:flex">
        <div className="relative mx-auto w-full max-w-md">
          <Search
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-input bg-background py-2 pr-10 pl-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('changeTheme')}
        >
          <Sun className="size-4.5" aria-hidden />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('systems')}
        >
          <Grid3x3 className="size-4.5" aria-hidden />
        </button>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('logout')}
        >
          <LogOut className="size-4.5" aria-hidden />
        </button>
        <div className="mr-2 flex items-center gap-2.5 border-r border-border pr-3">
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold text-foreground">{t('admin')}</p>
            <p className="text-xs text-muted-foreground">{t('userName')}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            ح.ک
          </div>
        </div>
      </div>
    </header>
  )
}
