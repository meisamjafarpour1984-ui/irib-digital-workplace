'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navItems } from '@/lib/portal-data'
import { PortalLogo } from './portal-logo'

export function PortalHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <PortalLogo />

        {/* Desktop nav */}
        <nav aria-label="ناوبری اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.active ? 'page' : undefined}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-brand'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {item.label}
                  {item.active && (
                    <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="باز کردن منو"
          className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav aria-label="ناوبری موبایل" className="border-t border-border bg-card lg:hidden">
          <ul className="mx-auto max-w-[1440px] px-4 py-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.active ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    item.active ? 'bg-brand-light text-brand' : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
