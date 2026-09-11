'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PortalLogo } from '@/components/portal/portal-logo'
import { User, KeyRound, LogIn, Shield, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { authApi } from '@/lib/services/auth'
import { useAuthStore, type AuthUser } from '@/lib/stores/auth-store'

type Step = 'credentials' | 'success'

export default function LoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [step, setStep] = useState<Step>('credentials')
  const [personnelCode, setPersonnelCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if Keycloak is enabled
  const useKeycloak = process.env.NEXT_PUBLIC_AUTH_TYPE === 'keycloak'

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')
    try {
      // Demo account - skip OTP verification
      const demoUser: AuthUser = {
        id: 'demo-user-001',
        name: 'کاربر دمو',
        personnelCode: '123456',
        email: 'demo@irib.ir',
        departments: [{ id: 'dept-001', name: 'روابط عمومی' }],
        roles: ['admin'],
        permissions: ['*'],
      }
      const demoToken = 'demo-token-' + Date.now()
      apiClient.setToken(demoToken)
      setSession(demoUser, demoToken)
      setStep('success')
      router.replace('/dashboard')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      let session

      if (useKeycloak) {
        // Use Keycloak login
        session = await authApi.keycloakLogin({ personnelCode, password })
        // Store refresh token for Keycloak
        if (session.refreshToken) {
          localStorage.setItem('refreshToken', session.refreshToken)
        }
      } else {
        // Use local JWT login
        session = await authApi.devLogin({ personnelCode, password })
      }

      apiClient.setToken(session.accessToken)
      localStorage.setItem('accessToken', session.accessToken)
      setSession(session.user, session.accessToken)
      setStep('success')
      router.replace('/dashboard')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <PortalLogo />
          </div>

          {/* Credentials Step */}
          {step === 'credentials' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10">
                  <Shield className="size-7 text-brand" aria-hidden />
                </div>
                <h1 className="mt-3 text-heading-1 text-foreground">{t('title')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
              </div>

              <div className="space-y-4">
                {useKeycloak && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4" />
                      <span>{t('keycloakEnabled')}</span>
                    </div>
                  </div>
                )}
                {error && (
                  <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">
                    {error}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="personnelCode"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {t('personnelCode')}
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      id="personnelCode"
                      name="personnelCode"
                      type="text"
                      value={personnelCode}
                      onChange={(e) => setPersonnelCode(e.target.value)}
                      placeholder={t('personnelCodePlaceholder')}
                      className="h-11 w-full rounded-xl border border-input bg-background pe-9 ps-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {t('password')}
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="h-11 w-full rounded-xl border border-input bg-background pe-9 ps-9 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogin()}
                  disabled={!personnelCode || !password || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <LogIn className="size-4" aria-hidden />
                  )}
                  {t('login')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDemoLogin()}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <LogIn className="size-4" aria-hidden />
                  )}
                  {t('demoLogin')}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <a href="#" className="text-brand hover:underline">
                    {t('forgotPassword')}
                  </a>
                  <a href="/mobile/register" className="text-brand hover:underline">
                    {t('register')}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
                <LogIn className="size-8 text-success" aria-hidden />
              </div>
              <h1 className="mt-4 text-heading-1 text-foreground">{t('loginSuccess')}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t('redirecting')}</p>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">{t('footer')}</p>
        </div>
      </div>
    </div>
  )
}
