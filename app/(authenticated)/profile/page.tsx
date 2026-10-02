'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Camera,
  Save,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  User,
  FileText,
  Bell,
  Settings,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AuthButton } from '@/components/auth/auth-button'
import { apiClient } from '@/lib/api-client'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [mobile, setMobile] = useState(user?.mobile || '')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await apiClient.put('/users/me', { name, email, mobile, bio })
      updateUser({ name, email, mobile })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const profileData = {
    name: user?.name || t('user'),
    personnelCode: user?.personnelCode || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    department: (() => {
      const dept = user?.departments?.[0] as
        string | { name: string | { fa?: string; en?: string } } | undefined
      if (typeof dept === 'string') return dept
      if (dept && typeof dept === 'object' && 'name' in dept)
        return typeof dept.name === 'object' ? dept.name.fa || dept.name.en : String(dept.name)
      return t('department')
    })(),
    role: (() => {
      const role = user?.roles?.[0] as
        string | { name: string | { fa?: string; en?: string } } | undefined
      if (typeof role === 'string') return role
      if (role && typeof role === 'object' && 'name' in role)
        return typeof role.name === 'object' ? role.name.fa || role.name.en : String(role.name)
      return t('role')
    })(),
    unit: t('unit'),
    joinDate: '۱۳۹۸/۰۳/۰۱',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header for employee panel */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <User className="size-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">{t('panelTitle')}</h1>
              <p className="text-xs text-muted-foreground">{user?.name || t('user')}</p>
            </div>
          </div>
          <AuthButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:bg-secondary"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <FileText className="size-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{t('requests')}</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:bg-secondary"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Bell className="size-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{t('announcements')}</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:bg-secondary"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Building2 className="size-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{t('myUnit')}</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:bg-secondary"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Settings className="size-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{t('settings')}</span>
            </button>
          </div>

          {/* Header */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="flex size-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-brand">
                  {profileData.name.slice(0, 1)}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -left-1 flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-lg"
                  aria-label={t('changePhoto')}
                >
                  <Camera className="size-4" />
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-heading-1 text-foreground">{profileData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {profileData.role} · {profileData.department}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3" aria-hidden />
                    {profileData.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3" aria-hidden />
                    {profileData.unit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" aria-hidden />
                    {t('joinDate', { date: profileData.joinDate })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-heading-1 text-foreground">{t('editInfo')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('personnelCode')}
                  </label>
                  <input
                    type="text"
                    value={profileData.personnelCode}
                    disabled
                    className="w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pe-9 ps-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('mobile')}
                  </label>
                  <div className="relative">
                    <Phone
                      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pe-9 ps-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('aboutMe')}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                {saveSuccess && <span className="text-sm text-success">{t('savedSuccess')}</span>}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-heading-1 text-foreground">{t('security')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('changePassword')}</p>
                  <p className="text-xs text-muted-foreground">{t('lastChange', { days: '۳۰' })}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  {t('change')}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('twoFactor')}</p>
                  <p className="text-xs text-muted-foreground">{t('twoFactorVia')}</p>
                </div>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  {t('active')}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('connectedDevices')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('activeDevices', { count: '۲' })}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  {t('view')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
