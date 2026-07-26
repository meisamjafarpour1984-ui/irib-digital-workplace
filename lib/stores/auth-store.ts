import { create } from 'zustand'

export interface AuthUser {
  id: string
  name: string
  personnelCode: string
  email?: string | null
  mobile?: string | null
  departments: Array<{ id: string; name: unknown }>
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  initialized: boolean
  setSession: (user: AuthUser, accessToken: string) => void
  clearSession: () => void
  setInitialized: () => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  initialized: false,
  setSession: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, initialized: true }),
  clearSession: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, initialized: true }),
  setInitialized: () => set({ initialized: true }),
  hasPermission: (permission) => {
    const permissions = get().user?.permissions ?? []
    return permissions.includes('*') || permissions.includes(permission)
  },
}))
