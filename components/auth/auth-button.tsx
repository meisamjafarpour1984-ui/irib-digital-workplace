'use client'

import { useRouter } from 'next/navigation'
import { LogIn, LayoutDashboard, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTranslations } from 'next-intl'

export function AuthButton() {
  const t = useTranslations('authButton')
  const router = useRouter()
  const { user, token, clearSession } = useAuthStore()

  // Check if user has admin/management roles
  const hasManagementRole = user?.roles?.some((role) =>
    ['ADMIN', 'EDITOR', 'MANAGER'].includes(role.code)
  )

  const handleLogin = () => {
    router.push('/login')
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  const handleEmployeePanel = () => {
    router.push('/profile')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    clearSession()
    router.push('/')
  }

  // Not logged in - show login button
  if (!token || !user) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-hover"
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">{t('login')}</span>
      </button>
    )
  }

  // Logged in with management role - show dashboard button
  if (hasManagementRole) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDashboard}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-hover"
        >
          <LayoutDashboard className="size-4" />
          <span className="hidden sm:inline">{t('dashboard')}</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          aria-label={t('logout')}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    )
  }

  // Regular user - show employee panel button
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleEmployeePanel}
        className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-hover"
      >
        <User className="size-4" />
        <span className="hidden sm:inline">{t('employeePanel')}</span>
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        aria-label={t('logout')}
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
