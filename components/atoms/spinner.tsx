'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const t = useTranslations('common')
  return (
    <Loader2
      className={cn('animate-spin text-brand', sizeClasses[size], className)}
      aria-label={t('loading')}
    />
  )
}
