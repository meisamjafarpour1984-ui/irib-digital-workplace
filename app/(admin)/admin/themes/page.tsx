'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Sun, Calendar, Save, Loader2, Download } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

export default function ThemeManagerPage() {
  const { tokens, stats, loading, error, activateTheme, exportTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'colors' | 'occasions'>('colors')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
    }, 1000)
  }

  const handleExport = async () => {
    try {
      await exportTheme()
    } catch (err) {
      alert('خطا در خروجی گرفتن')
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateTheme(id)
    } catch (err) {
      alert('خطا در فعال‌سازی تم')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">مدیریت پوسته</h1>
              <p className="mt-1 text-body-md text-muted-foreground">
                {stats?.totalTokens || 0} تم تعریف شده ({stats?.activeTokens || 0} فعال)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="size-4" aria-hidden />
                خروجی
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" aria-hidden />
                )}
                ذخیره
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'colors'
                  ? 'bg-brand text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sun className="size-4" aria-hidden />
              رنگ‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('occasions')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'occasions'
                  ? 'bg-brand text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Calendar className="size-4" aria-hidden />
              مناسبت‌ها
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : activeTab === 'colors' ? (
            <div className="space-y-4">
              {tokens.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  هیچ تمی یافت نشد
                </div>
              ) : (
                tokens.map((token) => (
                  <div
                    key={token.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{token.name}</p>
                        <p className="text-xs text-muted-foreground">{token.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {token.isDefault && (
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                            پیش‌فرض
                          </span>
                        )}
                        {token.isActive && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            فعال
                          </span>
                        )}
                        {!token.isActive && (
                          <button
                            type="button"
                            onClick={() => handleActivate(token.id)}
                            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
                          >
                            فعال‌سازی
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              مدیریت مناسبت‌ها در حال توسعه است
            </div>
          )}
        </Container>
      </Section>
    </div>
  )
}
