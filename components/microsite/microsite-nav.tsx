import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { microNav } from '@/lib/microsite-data'

export function MicrositeNav() {
  return (
    <div className="glass sticky top-0 z-20 rounded-2xl px-2 py-2 shadow-sm">
      <nav className="flex items-center justify-between gap-2">
        <ul className="flex flex-wrap items-center gap-1">
          {microNav.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <a
                  href="#"
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors ${
                    item.active
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-brand hover:underline sm:flex"
        >
          بازگشت به پرتال
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </nav>
    </div>
  )
}
