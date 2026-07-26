import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  personnelCode: string
  department: string
  roles: string[]
  permissions: string[]
  scopes: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        return user.permissions.includes(permission) || user.permissions.includes('*')
      },

      hasAnyPermission: (permissions) => {
        const { user } = get()
        if (!user) return false
        return permissions.some(
          (p) => user.permissions.includes(p) || user.permissions.includes('*')
        )
      },
    }),
    {
      name: 'irib-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
