import { Search, Bell, Sun, Grid3x3 } from 'lucide-react'

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-card/80 px-6 py-3.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <h1 className="text-lg font-extrabold text-foreground">داشبورد مدیریتی</h1>
          <p className="text-xs text-muted-foreground">مرکز صدا و سیمای آذربایجان شرقی</p>
        </div>
      </div>

      <div className="hidden flex-1 items-center md:flex">
        <div className="relative mx-auto w-full max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder="جستجو در سامانه مدیریت..."
            className="w-full rounded-xl border border-input bg-background py-2 pr-10 pl-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="تغییر پوسته"
        >
          <Sun className="size-4.5" aria-hidden />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="سامانه‌ها"
        >
          <Grid3x3 className="size-4.5" aria-hidden />
        </button>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="اعلان‌ها"
        >
          <Bell className="size-4.5" aria-hidden />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error ring-2 ring-card" aria-hidden />
        </button>
        <div className="mr-2 flex items-center gap-2.5 border-r border-border pr-3">
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold text-foreground">مدیر سیستم</p>
            <p className="text-xs text-muted-foreground">حمید کریمی</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            ح.ک
          </div>
        </div>
      </div>
    </header>
  )
}
