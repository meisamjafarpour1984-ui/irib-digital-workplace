'use client'

import { quickLinks } from '@/lib/portal-data'
import type { WidgetProps } from './types'

export function QuickAccessWidget({ config }: WidgetProps) {
  const maxItems = (config?.maxItems as number) ?? 10
  const displayLinks = quickLinks.slice(0, maxItems)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-center text-heading-1 text-foreground">دسترسی سریع به سامانه‌ها</h2>
      <ul className="grid grid-cols-4 gap-2.5">
        {displayLinks.map(({ label, icon: Icon, href }) => (
          <li key={label}>
            <a
              href={href}
              className="glass flex h-full flex-col items-center justify-center gap-2 rounded-xl p-3 text-center transition-transform hover:scale-[1.03] hover:border-brand/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-[11px] font-medium leading-tight text-foreground">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
