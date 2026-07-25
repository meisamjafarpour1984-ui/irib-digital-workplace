'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Sun, Calendar, Save } from 'lucide-react'

interface ThemeToken {
  name: string
  label: string
  value: string
  type: 'color' | 'size' | 'select'
  options?: string[]
}

const lightTokens: ThemeToken[] = [
  { name: '--brand-primary', label: 'رنگ اصلی (Primary)', value: '#00a6b6', type: 'color' },
  { name: '--brand-primary-hover', label: 'رنگ Hover', value: '#009faf', type: 'color' },
  { name: '--gold', label: 'رنگ طلا (Gold)', value: '#cda349', type: 'color' },
  { name: '--navy', label: 'سرمه‌ای (Navy)', value: '#0f172a', type: 'color' },
  { name: '--background', label: 'پس‌زمینه', value: '#fafcfd', type: 'color' },
  { name: '--card', label: 'کارت', value: '#ffffff', type: 'color' },
  { name: '--border', label: 'حاشیه', value: '#e2e8ec', type: 'color' },
  { name: '--radius', label: 'شعاع گوشه', value: '0.875rem', type: 'size' },
]

const occasions = [
  { id: 'nowruz', name: 'نوروز', startDate: '۱ فروردین', endDate: '۱۳ فروردین', color: '#059669' },
  { id: 'muharram', name: 'محرم', startDate: '۱ محرم', endDate: '۱۰ صفر', color: '#0f172a' },
  { id: 'yalda', name: 'یلدا', startDate: '۳۰ آذر', endDate: '۳۰ آذر', color: '#dc2626' },
  { id: 'saffron', name: 'هفته زعفران', startDate: '۱۵ آبان', endDate: '۲۲ آبان', color: '#d97706' },
]

export default function ThemeManagerPage() {
  const [tokens, setTokens] = useState(lightTokens)
  const [activeTab, setActiveTab] = useState<'colors' | 'occasions'>('colors')

  const updateToken = (name: string, value: string) => {
    setTokens((prev) => prev.map((t) => (t.name === name ? { ...t, value } : t)))
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">مدیریت پوسته</h1>
              <p className="mt-1 text-body-md text-muted-foreground">ویرایش توکن‌های طراحی و تم‌های مناسبتی</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <Save className="size-4" aria-hidden />
              ذخیره تغییرات
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'colors' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sun className="size-4" aria-hidden />
              رنگ‌ها و توکن‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('occasions')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'occasions' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Calendar className="size-4" aria-hidden />
              تم‌های مناسبتی
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Token Editor */}
            <div className="lg:col-span-2">
              {activeTab === 'colors' ? (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-heading-1 text-foreground">توکن‌های رنگ</h2>
                  <div className="space-y-4">
                    {tokens.map((token) => (
                      <div key={token.name} className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={token.value}
                            onChange={(e) => updateToken(token.name, e.target.value)}
                            className="size-10 cursor-pointer rounded-lg border border-border"
                            aria-label={token.label}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{token.label}</p>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={token.value}
                          onChange={(e) => updateToken(token.name, e.target.value)}
                          className="ml-auto w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          aria-label={`مقدار ${token.label}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-heading-1 text-foreground">تم‌های مناسبتی</h2>
                  <div className="space-y-3">
                    {occasions.map((occ) => (
                      <div
                        key={occ.id}
                        className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-brand/40"
                      >
                        <div
                          className="size-10 shrink-0 rounded-lg"
                          style={{ backgroundColor: occ.color }}
                          aria-hidden
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{occ.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {occ.startDate} — {occ.endDate}
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-heading-1 text-foreground">پیش‌نمایش زنده</h2>
                <div
                  className="overflow-hidden rounded-xl border border-border"
                  style={{
                    '--preview-primary': tokens.find((t) => t.name === '--brand-primary')?.value,
                    '--preview-bg': tokens.find((t) => t.name === '--background')?.value,
                    '--preview-card': tokens.find((t) => t.name === '--card')?.value,
                    '--preview-border': tokens.find((t) => t.name === '--border')?.value,
                  } as React.CSSProperties}
                >
                  <div className="p-4" style={{ backgroundColor: 'var(--preview-bg)' }}>
                    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--preview-card)', border: '1px solid var(--preview-border)' }}>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: 'var(--preview-primary)' }} />
                        <span className="text-xs font-bold text-foreground">عنوان ویجت</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-3/4 rounded bg-muted" />
                        <div className="h-2 w-1/2 rounded bg-muted" />
                      </div>
                      <button
                        type="button"
                        className="mt-3 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: 'var(--preview-primary)' }}
                      >
                        دکمه نمونه
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
