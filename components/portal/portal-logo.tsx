'use client'

import { Radio } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function PortalLogo({ variant = 'default' }: { variant?: 'default' | 'inverse' }) {
  const t = useTranslations('portal.logo')
  const isInverse = variant === 'inverse'
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-11 items-center justify-center rounded-xl ${
          isInverse ? 'bg-white/15 text-white' : 'peds-pattern text-white'
        }`}
      >
        <Radio className="size-6" aria-hidden />
      </div>
      <div className="text-right leading-tight">
        <p className={`text-base font-extrabold ${isInverse ? 'text-white' : 'text-foreground'}`}>
          {t('orgName')}
        </p>
        <p className={`text-xs ${isInverse ? 'text-white/70' : 'text-brand'}`}>{t('tagline')}</p>
      </div>
    </div>
  )
}
