'use client'

import { createContext, useContext, useMemo } from 'react'

type Permission = string
type Scope = string

interface PermissionContextValue {
  permissions: Permission[]
  scopes: Scope[]
  hasPermission: (permission: Permission, scope?: Scope) => boolean
  hasAnyPermission: (permissions: Permission[], scope?: Scope) => boolean
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined)

interface PermissionProviderProps {
  children: React.ReactNode
  permissions?: Permission[]
  scopes?: Scope[]
}

export function PermissionProvider({ children, permissions = [], scopes = [] }: PermissionProviderProps) {
  const value = useMemo(() => ({
    permissions,
    scopes,
    hasPermission: (permission: Permission, scope?: Scope) => {
      const hasPerm = permissions.includes(permission) || permissions.includes('*')
      if (!scope) return hasPerm
      return hasPerm && (scopes.includes(scope) || scopes.includes('*'))
    },
    hasAnyPermission: (perms: Permission[], scope?: Scope) => {
      return perms.some(p => {
        const hasPerm = permissions.includes(p) || permissions.includes('*')
        if (!scope) return hasPerm
        return hasPerm && (scopes.includes(scope) || scopes.includes('*'))
      })
    },
  }), [permissions, scopes])

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission(permission: Permission, scope?: Scope) {
  const ctx = useContext(PermissionContext)
  if (!ctx) return true // No provider = public access
  return ctx.hasPermission(permission, scope)
}

export function useAnyPermission(permissions: Permission[], scope?: Scope) {
  const ctx = useContext(PermissionContext)
  if (!ctx) return true
  return ctx.hasAnyPermission(permissions, scope)
}
