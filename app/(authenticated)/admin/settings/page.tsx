'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  Settings,
  Shield,
  MessageSquare,
  Mail,
  Bell,
  Database,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  History,
  AlertTriangle,
  Lock,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

type SettingCategory =
  'AUTHENTICATION' | 'SMS' | 'EMAIL' | 'NOTIFICATION' | 'STORAGE' | 'INTEGRATION' | 'GENERAL'

interface SystemSetting {
  id: string
  key: string
  category: SettingCategory
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  type: string
  description: string | { fa?: string; en?: string }
  isPublic: boolean
  isEditable: boolean
  updatedAt: string
  source?: string
}

interface AuditLog {
  action: string
  actorName: string
  createdAt: string
  oldData: Record<string, unknown>
  newData: Record<string, unknown>
}

const categoryIcons: Record<SettingCategory, typeof Settings> = {
  AUTHENTICATION: Shield,
  SMS: MessageSquare,
  EMAIL: Mail,
  NOTIFICATION: Bell,
  STORAGE: Database,
  INTEGRATION: Globe,
  GENERAL: Settings,
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const t = useTranslations('admin.settings')

  const categoryLabels: Record<SettingCategory, string> = {
    AUTHENTICATION: t('categories.authentication'),
    SMS: t('categories.sms'),
    EMAIL: t('categories.email'),
    NOTIFICATION: t('categories.notification'),
    STORAGE: t('categories.storage'),
    INTEGRATION: t('categories.integration'),
    GENERAL: t('categories.general'),
  }

  const [settings, setSettings] = useState<Record<SettingCategory, SystemSetting[]>>(
    {} as Record<SettingCategory, SystemSetting[]>
  )
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('GENERAL')
  const [initializing, setInitializing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<AuditLog[]>([])
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showSecurityNotes, setShowSecurityNotes] = useState(false)

  const fetchHistory = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/settings/${key}/history`)
      if (!response.ok) throw new Error('Failed to fetch history')
      const data = await response.json()
      setHistory(data)
      setShowHistory(true)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const exportSettings = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/settings/export', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to export settings')
      const data = await response.json

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting settings:', error)
    } finally {
      setExporting(false)
    }
  }

  const importSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await fetch('/api/admin/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data.settings, updatedBy: user?.id }),
      })

      if (!response.ok) throw new Error('Failed to import settings')

      const result = await response.json()
      alert(`Import completed: ${result.success} successful, ${result.failed} failed`)
      await fetchSettings()
    } catch (error) {
      console.error('Error importing settings:', error)
      alert('Failed to import settings')
    } finally {
      setImporting(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()

      const grouped = data.reduce(
        (acc: Record<SettingCategory, SystemSetting[]>, setting: SystemSetting) => {
          if (!acc[setting.category]) acc[setting.category] = []
          acc[setting.category].push(setting)
          return acc
        },
        {}
      )

      setSettings(grouped)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaults = async () => {
    setInitializing(true)
    try {
      const response = await fetch('/api/admin/settings/initialize', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to initialize settings')
      await fetchSettings()
    } catch (error) {
      console.error('Error initializing settings:', error)
    } finally {
      setInitializing(false)
    }
  }

  const updateSetting = async (
    key: string,
    category: SettingCategory,
    value: unknown,
    type: string
  ) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, category, value, type, updatedBy: user?.id }),
      })
      if (!response.ok) throw new Error('Failed to update setting')

      setSettings((prev) => ({
        ...prev,
        [category]: prev[category].map((s) =>
          s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s
        ),
      }))
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }

  const renderSettingInput = (setting: SystemSetting) => {
    const description =
      typeof setting.description === 'string'
        ? setting.description
        : setting.description?.fa || setting.description?.en || ''

    if (setting.type === 'boolean') {
      const isEnabled = setting.value === true || setting.value?.value === true
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{description}</span>
          <button
            onClick={() => updateSetting(setting.key, setting.category, !isEnabled, setting.type)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: isEnabled ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )
    }

    if (setting.type === 'json' && setting.value?.options) {
      return (
        <div>
          <label className="text-sm text-muted-foreground block mb-2">{description}</label>
          <select
            value={setting.value?.value || setting.value}
            onChange={(e) =>
              updateSetting(
                setting.key,
                setting.category,
                { value: e.target.value, options: setting.value.options },
                setting.type
              )
            }
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {setting.value.options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (setting.type === 'encrypted') {
      return (
        <div>
          <label className="text-sm text-muted-foreground block mb-2">{description}</label>
          <input
            type="password"
            value={setting.value || ''}
            onChange={(e) =>
              updateSetting(setting.key, setting.category, e.target.value, setting.type)
            }
            placeholder="••••••••"
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )
    }

    if (setting.type === 'number') {
      return (
        <div>
          <label className="text-sm text-muted-foreground block mb-2">{description}</label>
          <input
            type="number"
            value={setting.value || ''}
            onChange={(e) =>
              updateSetting(setting.key, setting.category, parseInt(e.target.value), setting.type)
            }
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )
    }

    if (setting.type === 'json' && typeof setting.value === 'object') {
      return (
        <div>
          <label className="text-sm text-muted-foreground block mb-2">{description}</label>
          <input
            type="text"
            value={setting.value?.fa || setting.value?.en || JSON.stringify(setting.value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                updateSetting(setting.key, setting.category, parsed, setting.type)
              } catch {
                updateSetting(setting.key, setting.category, e.target.value, setting.type)
              }
            }}
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )
    }

    return (
      <div>
        <label className="text-sm text-muted-foreground block mb-2">{description}</label>
        <input
          type="text"
          value={setting.value || ''}
          onChange={(e) =>
            updateSetting(setting.key, setting.category, e.target.value, setting.type)
          }
          className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    )
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin size-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={initializeDefaults}
                disabled={initializing}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-accent"
              >
                <RefreshCw className={`size-4 ${initializing ? 'animate-spin' : ''}`} />
                {initializing ? t('initializing') : t('initializingButton')}
              </button>
              <button
                onClick={exportSettings}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-accent"
              >
                <Download className={`size-4 ${exporting ? 'animate-pulse' : ''}`} />
                {exporting ? t('exporting') : t('exportButton')}
              </button>
              <label className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-accent cursor-pointer">
                <Upload className={`size-4 ${importing ? 'animate-pulse' : ''}`} />
                {importing ? t('importing') : t('importButton')}
                <input type="file" accept=".json" onChange={importSettings} className="hidden" />
              </label>
              <button
                onClick={() => setShowSecurityNotes(!showSecurityNotes)}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-accent"
              >
                <Lock className="size-4" />
                {t('securityNotes')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-1">
              {(Object.keys(categoryLabels) as SettingCategory[]).map((category) => {
                const Icon = categoryIcons[category]
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-right transition-colors ${
                      activeCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span>{categoryLabels[category]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{categoryLabels[activeCategory]}</h2>
                <button
                  onClick={() => {
                    const categorySettings = settings[activeCategory] || []
                    Promise.all(
                      categorySettings.map((s) => updateSetting(s.key, s.category, s.value, s.type))
                    )
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="size-4" />
                  {t('saveAll')}
                </button>
              </div>

              <div className="space-y-6">
                {(settings[activeCategory] || []).map((setting) => (
                  <div key={setting.id} className="flex items-start justify-between py-4 border-b">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{setting.key}</p>
                      {renderSettingInput(setting)}
                      {setting.source === 'environment' && (
                        <p className="text-xs text-yellow-600 mt-1">{t('environmentOverride')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchHistory(setting.key)}
                        className="p-2 rounded hover:bg-accent"
                        title="مشاهده تاریخچه"
                      >
                        <History className="size-4" />
                      </button>
                      {!setting.isEditable && (
                        <span className="text-xs text-muted-foreground">{t('locked')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(settings[activeCategory] || []).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">{t('noSettings')}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('history.title')}</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded hover:bg-accent">
                ✕
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('history.empty')}</p>
            ) : (
              <div className="space-y-4">
                {history.map((log, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('history.by', { name: log.actorName })}
                    </p>
                    {log.oldData && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          {t('history.previousValue')}
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(log.oldData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.newData && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {t('history.newValue')}
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(log.newData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Notes Modal */}
      {showSecurityNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="size-5 text-yellow-600" />
                {t('security.title')}
              </h3>
              <button
                onClick={() => setShowSecurityNotes(false)}
                className="p-2 rounded hover:bg-accent"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-semibold mb-2 text-yellow-800">
                  {t('security.encryption.title')}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-900">
                  <li>{t('security.encryption.item1')}</li>
                  <li>{t('security.encryption.item2')}</li>
                  <li>{t('security.encryption.item3')}</li>
                  <li>{t('security.encryption.item4')}</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold mb-2 text-blue-800">Environment Override</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-900">
                  <li>{t('security.override.item1')}</li>
                  <li>{t('security.override.item2')}</li>
                  <li>{t('security.override.item3')}</li>
                  <li>{t('security.override.item4')}</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="font-semibold mb-2 text-red-800">{t('security.audit.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-red-900">
                  <li>{t('security.audit.item1')}</li>
                  <li>{t('security.audit.item2')}</li>
                  <li>{t('security.audit.item3')}</li>
                  <li>{t('security.audit.item4')}</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-semibold mb-2 text-green-800">{t('security.backup.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-green-900">
                  <li>{t('security.backup.item1')}</li>
                  <li>{t('security.backup.item2')}</li>
                  <li>{t('security.backup.item3')}</li>
                  <li>{t('security.backup.item4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
