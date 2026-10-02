import { useTranslations } from 'next-intl'
import { KeyRound, LifeBuoy, LogIn, User } from 'lucide-react'

export function LoginCard() {
  const t = useTranslations('loginCard')
  return (
    <div className="glass rounded-2xl p-5 shadow-sm">
      <h2 className="mb-4 text-center text-base font-bold text-foreground">{t('title')}</h2>

      <form className="flex flex-col gap-3">
        <div className="relative">
          <User
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            placeholder={t('usernamePlaceholder')}
            aria-label={t('username')}
            className="h-11 w-full rounded-lg border border-input bg-background/70 pe-9 ps-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="password"
            placeholder={t('passwordPlaceholder')}
            aria-label={t('password')}
            className="h-11 w-full rounded-lg border border-input bg-background/70 pe-9 ps-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
        >
          <LogIn className="size-4" aria-hidden />
          {t('login')}
        </button>
        <a
          href="/help"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:underline"
        >
          <LifeBuoy className="size-3.5" aria-hidden />
          {t('guide')}
        </a>
      </form>
    </div>
  )
}
