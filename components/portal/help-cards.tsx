import { helpCards } from '@/lib/portal-data'

export function HelpCards() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {helpCards.map(({ id, title, desc, cta, icon: Icon }) => (
        <div
          key={id}
          className="glass flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand">
            <Icon className="size-6" aria-hidden />
          </span>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
          <button
            type="button"
            className="mt-1 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
          >
            {cta}
          </button>
        </div>
      ))}
    </section>
  )
}
