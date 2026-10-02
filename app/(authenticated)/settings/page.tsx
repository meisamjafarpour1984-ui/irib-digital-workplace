'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Sun, Moon, Bell, Globe, Monitor, Save, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/providers'
import { useUserSettings, type UserSettings } from '@/hooks/use-user-settings'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { settings, updateTheme, updateNotifications, updateLanguage, updateFontSize, saving } =
    useUserSettings()
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    try {
      await updateTheme(theme)
      await updateNotifications(settings.notifications)
      await updateLanguage(settings.language)
      await updateFontSize(settings.fontSize)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-display-lg text-foreground">تنظیمات</h1>

            {/* Theme */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-heading-1 text-foreground">
                <Monitor className="size-5" aria-hidden />
                پوسته و نمایش
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    حالت نمایش
                  </label>
                  <div className="flex gap-3">
                    {[
                      { id: 'light', label: 'روشن', icon: Sun },
                      { id: 'dark', label: 'تاریک', icon: Moon },
                      { id: 'system', label: 'سیستم', icon: Monitor },
                    ].map((opt) => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTheme(opt.id as 'light' | 'dark' | 'system')}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
                            theme === opt.id
                              ? 'border-brand bg-brand/5 text-brand'
                              : 'border-border text-muted-foreground hover:border-brand/30'
                          }`}
                        >
                          <Icon className="size-4" aria-hidden />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    اندازه متن
                  </label>
                  <div className="flex gap-3">
                    {[
                      { id: 'small', label: 'کوچک' },
                      { id: 'medium', label: 'متوسط' },
                      { id: 'large', label: 'بزرگ' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateFontSize(opt.id as 'small' | 'medium' | 'large')}
                        className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                          settings.fontSize === opt.id
                            ? 'border-brand bg-brand/5 text-brand'
                            : 'border-border text-muted-foreground hover:border-brand/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-heading-1 text-foreground">
                <Bell className="size-5" aria-hidden />
                اعلان‌ها
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'اعلان ایمیلی', desc: 'دریافت اعلان‌ها از طریق ایمیل' },
                  { key: 'push', label: 'اعلان فشاری', desc: 'دریافت اعلان در موبایل' },
                  { key: 'sms', label: 'پیامک', desc: 'دریافت اعلان از طریق SMS' },
                  { key: 'inbox', label: 'کارتابل', desc: 'نمایش در کارتابل ارتباطات' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={
                          settings.notifications[item.key as keyof typeof settings.notifications]
                        }
                        onChange={(e) =>
                          updateNotifications({ [item.key]: e.target.checked } as Partial<
                            UserSettings['notifications']
                          >)
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-heading-1 text-foreground">
                <Globe className="size-5" aria-hidden />
                زبان و منطقه
              </h2>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">زبان رابط</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateLanguage(e.target.value as 'fa' | 'en')}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                  <option value="az">آذربایجانی</option>
                </select>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
              {saveSuccess && <span className="text-sm text-success">ذخیره شد!</span>}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
