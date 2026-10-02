/**
 * IRIB Digital Workplace Platform - Theme Builder Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import {
  Palette,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  XCircle,
  Sliders,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

export default function ThemeBuilderPage() {
  const [activeTab, setActiveTab] = useState('tokens')
  const [searchQuery, setSearchQuery] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedToken, setSelectedToken] = useState<{
    name: string
    value: string
    category: string
  } | null>(null)

  const { themes, loading } = useTheme()

  const [previewTheme, setPreviewTheme] = useState<{
    primary: string
    secondary: string
    background: string
    text: string
  }>({
    primary: '#2563eb',
    secondary: '#10b981',
    background: '#ffffff',
    text: '#0f172a',
  })

  const themeTokens = [
    {
      id: 1,
      name: 'brand-primary',
      category: 'brand',
      value: '#2563eb',
      description: 'رنگ اصلی برند',
      isActive: true,
    },
    {
      id: 2,
      name: 'brand-secondary',
      category: 'brand',
      value: '#10b981',
      description: 'رنگ ثانویه برند',
      isActive: true,
    },
    {
      id: 3,
      name: 'text-primary',
      category: 'typography',
      value: '#0f172a',
      description: 'رنگ متن اصلی',
      isActive: true,
    },
    {
      id: 4,
      name: 'text-secondary',
      category: 'typography',
      value: '#64748b',
      description: 'رنگ متن ثانویه',
      isActive: true,
    },
    {
      id: 5,
      name: 'background-color',
      category: 'surface',
      value: '#ffffff',
      description: 'رنگ پس‌زمینه اصلی',
      isActive: true,
    },
    {
      id: 6,
      name: 'surface-color',
      category: 'surface',
      value: '#f8fafc',
      description: 'رنگ پس‌زمینه ثانویه',
      isActive: true,
    },
    {
      id: 7,
      name: 'border-color',
      category: 'surface',
      value: '#e2e8f0',
      description: 'رنگ حاشیه',
      isActive: true,
    },
    {
      id: 8,
      name: 'success-color',
      category: 'semantic',
      value: '#22c55e',
      description: 'رنگ موفقیت',
      isActive: true,
    },
    {
      id: 9,
      name: 'error-color',
      category: 'semantic',
      value: '#ef4444',
      description: 'رنگ خطا',
      isActive: true,
    },
    {
      id: 10,
      name: 'warning-color',
      category: 'semantic',
      value: '#f59e0b',
      description: 'رنگ هشدار',
      isActive: true,
    },
  ]

  const tabs = [
    { id: 'tokens', label: 'Theme Tokens', count: themes?.length || 0 },
    { id: 'occasions', label: 'تم‌های مناسبتی', count: 0 },
    { id: 'presets', label: 'پریست‌ها', count: 0 },
  ]

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </main>
    )
  }

  const occasionThemes = [
    {
      id: 1,
      name: 'تم رمضان',
      description: 'تم مخصوص ماه رمضان',
      scheduledAt: '۱۴۰۴/۰۳/۰۱',
      expiresAt: '۱۴۰۴/۰۳/۳۰',
      isActive: false,
    },
    {
      id: 2,
      name: 'تم نوروز',
      description: 'تم مخصوص سال نو',
      scheduledAt: '۱۴۰۴/۰۱/۰۱',
      expiresAt: '۱۴۰۴/۰۱/۱۵',
      isActive: false,
    },
    {
      id: 3,
      name: 'تم یوم‌الله',
      description: 'تم مخصوص روزهای مقدس',
      scheduledAt: '۱۴۰۴/۰۲/۱۰',
      expiresAt: '۱۴۰۴/۰۲/۱۲',
      isActive: false,
    },
  ]

  const categoryStyles: Record<string, string> = {
    brand: 'bg-blue/10 text-blue',
    typography: 'bg-purple/10 text-purple',
    surface: 'bg-green/10 text-green',
    semantic: 'bg-brand/10 text-brand',
  }

  const categoryLabels: Record<string, string> = {
    brand: 'برند',
    typography: 'تایپوگرافی',
    surface: 'سطح',
    semantic: 'معنایی',
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت Theme</h1>
              <p className="text-sm text-muted-foreground">
                مدیریت توکن‌های طراحی و تم‌های مناسبتی
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              افزودن token
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Palette className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل tokens</p>
                  <p className="text-lg font-bold text-foreground">۲۴</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">فعال</p>
                  <p className="text-lg font-bold text-foreground">۲۲</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Sun className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تم‌های مناسبتی</p>
                  <p className="text-lg font-bold text-foreground">۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Moon className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">پریست‌ها</p>
                  <p className="text-lg font-bold text-foreground">۵</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
              <Filter className="size-4" />
              فیلتر
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand text-brand'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Tokens Tab */}
          {activeTab === 'tokens' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        دسته
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        مقدار
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        توضیحات
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {themeTokens.map((token) => (
                      <tr key={token.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <code className="rounded bg-accent px-2 py-1 text-sm text-foreground">
                            {token.name}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryStyles[token.category]}`}
                          >
                            {categoryLabels[token.category]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedToken(token)
                              setShowColorPicker(true)
                            }}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <div
                              className="size-6 rounded border border-border"
                              style={{ backgroundColor: token.value }}
                            />
                            <code className="text-sm text-muted-foreground">{token.value}</code>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {token.description}
                        </td>
                        <td className="px-4 py-3">
                          {token.isActive ? (
                            <CheckCircle className="size-5 text-success" />
                          ) : (
                            <span className="text-muted-foreground">غیرفعال</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="کپی"
                            >
                              <Copy className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="مشاهده"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="بیشتر"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Occasions Tab */}
          {activeTab === 'occasions' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {occasionThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Palette className="size-6" />
                    </div>
                    <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{theme.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{theme.description}</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3" />
                      <span>شروع: {theme.scheduledAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3" />
                      <span>پایان: {theme.expiresAt}</span>
                    </div>
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                    <Eye className="size-4" />
                    مشاهده تم
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { id: 1, name: 'تم پیش‌فرض', colors: ['#2563eb', '#10b981', '#ffffff', '#0f172a'] },
                { id: 2, name: 'تم تیره', colors: ['#1e40af', '#059669', '#1e293b', '#f8fafc'] },
                { id: 3, name: 'تم گرم', colors: ['#dc2626', '#f59e0b', '#fef3c7', '#1c1917'] },
                { id: 4, name: 'تم آبی', colors: ['#0891b2', '#0ea5e9', '#ecfeff', '#164e63'] },
                { id: 5, name: 'تم بنفش', colors: ['#7c3aed', '#a855f7', '#faf5ff', '#4c1d95'] },
              ].map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-full items-center justify-center rounded-lg bg-muted gap-1">
                      {preset.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{preset.name}</h3>
                  <button
                    onClick={() =>
                      setPreviewTheme({
                        primary: preset.colors[0],
                        secondary: preset.colors[1],
                        background: preset.colors[2],
                        text: preset.colors[3],
                      })
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white"
                  >
                    <RefreshCw className="size-4" />
                    اعمال تم
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Color Picker Modal */}
          {showColorPicker && selectedToken && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">ویرایش رنگ</h2>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <XCircle className="size-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">نام</label>
                    <input
                      type="text"
                      value={selectedToken.name}
                      readOnly
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      مقدار رنگ
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={selectedToken.value}
                        onChange={(e) =>
                          setSelectedToken({ ...selectedToken, value: e.target.value })
                        }
                        className="size-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedToken.value}
                        onChange={(e) =>
                          setSelectedToken({ ...selectedToken, value: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      پالت پیشنهادی
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4',
                        '#ec4899',
                        '#84cc16',
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedToken({ ...selectedToken, value: color })}
                          className="size-8 rounded border border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                      ذخیره تغییرات
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Panel */}
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 rounded-lg border border-border bg-card shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">پیش‌نمایش زنده</h3>
              <button className="rounded p-1 text-muted-foreground hover:bg-muted">
                <Sliders className="size-4" />
              </button>
            </div>
            <div
              className="rounded-lg p-4 mb-3"
              style={{
                backgroundColor: previewTheme.background,
                color: previewTheme.text,
                border: `2px solid ${previewTheme.primary}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="size-8 rounded-full"
                  style={{ backgroundColor: previewTheme.primary }}
                />
                <div className="flex-1">
                  <div
                    className="h-2 rounded mb-1"
                    style={{ backgroundColor: previewTheme.primary, opacity: 0.3 }}
                  />
                  <div
                    className="h-2 rounded w-2/3"
                    style={{ backgroundColor: previewTheme.secondary, opacity: 0.3 }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: previewTheme.primary }}
                >
                  دکمه اصلی
                </button>
                <button
                  className="flex-1 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: previewTheme.secondary, color: 'white' }}
                >
                  دکمه ثانویه
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPreviewTheme({
                    primary: '#2563eb',
                    secondary: '#10b981',
                    background: '#ffffff',
                    text: '#0f172a',
                  })
                }
                className="flex-1 py-2 rounded text-xs border border-border bg-card hover:bg-muted transition-colors"
              >
                <Sun className="size-3 inline mr-1" />
                روشن
              </button>
              <button
                onClick={() =>
                  setPreviewTheme({
                    primary: '#3b82f6',
                    secondary: '#10b981',
                    background: '#1e293b',
                    text: '#f8fafc',
                  })
                }
                className="flex-1 py-2 rounded text-xs border border-border bg-card hover:bg-muted transition-colors"
              >
                <Moon className="size-3 inline mr-1" />
                تیره
              </button>
            </div>
          </div>
        </main>
  )
}
