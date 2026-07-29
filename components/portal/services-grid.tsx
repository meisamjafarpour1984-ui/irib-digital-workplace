import { ArrowLeft, LayoutGrid } from 'lucide-react'
import { services } from '@/lib/portal-data'
import { AccessibleButton } from '@/components/ui/AccessibleButton'

export function ServicesGrid() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-light text-brand">
            <LayoutGrid className="size-4" aria-hidden />
          </span>
          <h2 className="text-base font-bold text-foreground">خدمات و سامانه‌ها</h2>
        </div>
        <AccessibleButton
          href="/dashboard"
          className="text-xs font-medium text-brand hover:underline"
        >
          مشاهده همه
        </AccessibleButton>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {services.map(({ label, icon: Icon, action }) => (
          <li key={label}>
            <AccessibleButton
              href="/dashboard"
              className="group flex h-full flex-col items-start gap-3 rounded-xl border border-border p-4 transition-all hover:border-brand/50 hover:shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="mt-auto flex items-center gap-1 text-xs font-medium text-brand">
                {action}
                <ArrowLeft
                  className="size-3.5 transition-transform group-hover:-translate-x-1"
                  aria-hidden
                />
              </span>
            </AccessibleButton>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary p-4">
        <p className="text-sm text-secondary-foreground">
          سامانه‌ای که به دنبال آن هستید را پیدا نکردید؟
        </p>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
        >
          درخواست دسترسی جدید
        </button>
      </div>
    </section>
  )
}
