'use client'

import { useEffect, type ReactNode } from 'react'
import { apiClient } from '@/lib/api-client'
import { authApi } from '@/lib/services/auth'
import { useAuthStore } from '@/lib/stores/auth-store'

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    let active = true

    authApi
      .refresh()
      .then((session) => {
        if (!active) return
        apiClient.setToken(session.accessToken)
        setSession(session.user, session.accessToken)
      })
      .catch(() => {
        if (!active) return
        apiClient.setToken(null)
        clearSession()
      })
      .finally(() => {
        if (active) setInitialized()
      })

    return () => {
      active = false
    }
  }, [clearSession, setSession, setInitialized])

  return children
}
