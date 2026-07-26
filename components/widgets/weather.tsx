'use client'

import { Cloud, Sun, Droplets, Wind } from 'lucide-react'

export function WeatherWidget() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-heading-1 text-foreground">آب و هوای تبریز</h2>
        </div>
      </div>

      <div className="text-center">
        <Sun className="mx-auto size-10 text-gold" aria-hidden />
        <p className="mt-2 text-3xl font-extrabold text-foreground">۲۳°C</p>
        <p className="text-sm text-muted-foreground">آفتابی</p>
        <p className="text-xs text-muted-foreground">تبریز، آذربایجان شرقی</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border p-2">
          <Droplets className="mx-auto size-4 text-info" aria-hidden />
          <p className="mt-1 text-xs font-bold text-foreground">۳۵٪</p>
          <p className="text-[10px] text-muted-foreground">رطوبت</p>
        </div>
        <div className="rounded-lg border border-border p-2">
          <Wind className="mx-auto size-4 text-muted-foreground" aria-hidden />
          <p className="mt-1 text-xs font-bold text-foreground">۱۲</p>
          <p className="text-[10px] text-muted-foreground">باد km/h</p>
        </div>
        <div className="rounded-lg border border-border p-2">
          <Cloud className="mx-auto size-4 text-muted-foreground" aria-hidden />
          <p className="mt-1 text-xs font-bold text-foreground">۱۰٪</p>
          <p className="text-[10px] text-muted-foreground">ابری</p>
        </div>
      </div>
    </div>
  )
}
