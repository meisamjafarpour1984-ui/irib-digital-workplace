import { microActions } from '@/lib/microsite-data'

export function MicroActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {microActions.map((action) => {
        const Icon = action.icon
        return (
          <div
            key={action.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand/40"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-brand">
              <Icon className="size-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-sm font-bold text-foreground">{action.title}</h3>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
              {action.desc}
            </p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-brand/10 px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              {action.cta}
            </button>
          </div>
        )
      })}
    </div>
  )
}
