import { create } from 'zustand'

export interface AuthUser {
  id: string
  name: string
  personnelCode: string
  email?: string | null
  mobile?: string | null
  departments: Array<{ id: string; name: unknown }>
  roles: Array<{
    id: string
    code: string
    name: string
    permissions?: string[]
    grantedPermissions?: string[]
    deniedPermissions?: string[]
  }>
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  initialized: boolean
  token: string | null
  setSession: (user: AuthUser, accessToken: string) => void
  clearSession: () => void
  setInitialized: () => void
  updateUser: (updates: Partial<AuthUser>) => void
  hasPermission: (permission: string) => boolean
  hasRole: (roleCode: string) => boolean
  hasAnyRole: (roleCodes: string[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  initialized: false,
  token: null,
  setSession: (user, accessToken) =>
    set({ user, accessToken, token: accessToken, isAuthenticated: true, initialized: true }),
  clearSession: () =>
    set({ user: null, accessToken: null, token: null, isAuthenticated: false, initialized: true }),
  setInitialized: () => set({ initialized: true }),
  updateUser: (updates) =>
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  hasPermission: (permission) => {
    const user = get().user
    if (!user) return false

    // Check direct permissions
    const directPermissions = user.permissions ?? []
    if (directPermissions.includes('*')) return true
    if (directPermissions.includes(permission)) return true

    // Check role permissions
    const rolePermissions = new Set<string>()
    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((p) => rolePermissions.add(p))
      }
      if (role.grantedPermissions) {
        role.grantedPermissions.forEach((p) => rolePermissions.add(p))
      }
    })

    // Check denied permissions
    const deniedPermissions = new Set<string>()
    user.roles.forEach((role) => {
      if (role.deniedPermissions) {
        role.deniedPermissions.forEach((p) => deniedPermissions.add(p))
      }
    })

    // If permission is denied, return false
    if (deniedPermissions.has(permission)) return false

    // Check if permission is granted through roles
    return rolePermissions.has(permission)
  },
  hasRole: (roleCode) => {
    const user = get().user
    if (!user) return false
    return user.roles.some((role) => role.code === roleCode)
  },
  hasAnyRole: (roleCodes) => {
    const user = get().user
    if (!user) return false
    return roleCodes.some((code) => user.roles.some((role) => role.code === code))
  },
}))

export type { AuthState }
