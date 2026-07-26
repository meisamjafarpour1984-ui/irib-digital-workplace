'use client'

import { CalendarDays, Clock } from 'lucide-react'

const prayerTimes = [
  { name: 'اذ صبح', time: '۰۴:۱۵' },
  { name: 'طلوع آفتاب', time: '۰۵:۴۲' },
  { name: 'اذ ظهر', time: '۱۲:۵۸' },
  { name: 'اذ عصر', time: '۱۶:۴۵' },
  { name: 'اذ مغرب', time: '۲۰:۱۲' },
  { name: 'اذ عشاء', time: '۲۱:۳۰' },
]

export function CalendarPrayerWidget() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-heading-1 text-foreground">تقویم و اوقات شرعی</h2>
        </div>
      </div>

      {/* Current Date */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-accent p-3">
        <CalendarDays className="size-5 text-brand" aria-hidden />
        <div>
          <p className="text-sm font-bold text-foreground">شنبه ۱۲ خرداد ۱۴۰۴</p>
          <p className="text-xs text-muted-foreground">۲۳ ذی‌القعده ۱۴۴۶</p>
        </div>
      </div>

      {/* Prayer Times */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          اوقات شرعی تبریز
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {prayerTimes.map((pt) => (
            <li
              key={pt.name}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">{pt.name}</span>
              <span className="text-xs font-bold text-foreground tabular-nums">{pt.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
