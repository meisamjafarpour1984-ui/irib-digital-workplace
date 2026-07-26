import { CalendarHeart } from 'lucide-react'

export function OccasionBanner({
  title = 'مناسبت ملی گرامی باد',
  cta = 'مشاهده برنامه‌ها',
}: {
  title?: string
  cta?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <img
        src="/images/banner-arg.png"
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 peds-pattern opacity-90" />
      <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md">
            <CalendarHeart className="size-6" aria-hidden />
          </span>
          <p className="text-balance text-lg font-extrabold text-white md:text-xl">{title}</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
