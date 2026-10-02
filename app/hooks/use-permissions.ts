/**
 * IRIB Digital Workplace Platform - Permission Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 *
 * این hook برای بررسی permissions در frontend استفاده می‌شود
 * و با ثابت‌های permission در lib/constants/permissions.ts هماهنگ است.
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { PERMISSIONS, PERMISSION_GROUPS, type Permission } from '@/lib/constants/permissions'

export function usePermissions() {
  const { user } = useAuthStore()
  const [userPermissions, setUserPermissions] = useState<Set<Permission>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.roles) {
      // Extract permissions from user roles
      const permissions = new Set<Permission>()

      user.roles.forEach((role) => {
        if (role.permissions) {
          role.permissions.forEach((permission) => {
            permissions.add(permission as Permission)
          })
        }

        // Add granted permissions from role assignment
        if (role.grantedPermissions) {
          role.grantedPermissions.forEach((permission) => {
            permissions.add(permission as Permission)
          })
        }
      })

      setUserPermissions(permissions)
    }
    setLoading(false)
  }, [user])

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.has(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => userPermissions.has(p))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => userPermissions.has(p))
  }

  const hasPermissionGroup = (groupName: keyof typeof PERMISSION_GROUPS): boolean => {
    const group = PERMISSION_GROUPS[groupName]
    return hasAnyPermission([...group])
  }

  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false
    return user.roles.some((r) => {
      return r.code === role
    })
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role))
  }

  const isAdmin = (): boolean => {
    return hasRole('ADMIN')
  }

  const isPortalManager = (): boolean => {
    return hasRole('PORTAL_MANAGER') || isAdmin()
  }

  const isDepartmentOfficer = (): boolean => {
    return hasRole('DEPARTMENT_OFFICER') || isPortalManager()
  }

  return {
    userPermissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionGroup,
    hasRole,
    hasAnyRole,
    isAdmin,
    isPortalManager,
    isDepartmentOfficer,
  }
}

export type PermissionCheckResult = {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canManage: boolean
}

export function useEntityPermissions(
  entity:
    | 'content'
    | 'form'
    | 'media'
    | 'user'
    | 'role'
    | 'organization'
    | 'widget'
    | 'analytics'
    | 'settings'
): PermissionCheckResult {
  const { hasPermission } = usePermissions()

  const permissionMap: Record<typeof entity, PermissionCheckResult> = {
    content: {
      canRead: hasPermission(PERMISSIONS.CONTENT_READ),
      canCreate: hasPermission(PERMISSIONS.CONTENT_CREATE),
      canUpdate: hasPermission(PERMISSIONS.CONTENT_UPDATE),
      canDelete: hasPermission(PERMISSIONS.CONTENT_DELETE),
      canManage: hasPermission(PERMISSIONS.CONTENT_MANAGE_SCOPE),
    },
    form: {
      canRead: hasPermission(PERMISSIONS.FORM_READ),
      canCreate: hasPermission(PERMISSIONS.FORM_CREATE),
      canUpdate: hasPermission(PERMISSIONS.FORM_UPDATE),
      canDelete: hasPermission(PERMISSIONS.FORM_DELETE),
      canManage: hasPermission(PERMISSIONS.FORM_MANAGE),
    },
    media: {
      canRead: hasPermission(PERMISSIONS.MEDIA_READ),
      canCreate: hasPermission(PERMISSIONS.MEDIA_CREATE),
      canUpdate: hasPermission(PERMISSIONS.MEDIA_UPDATE),
      canDelete: hasPermission(PERMISSIONS.MEDIA_DELETE),
      canManage: false, // Media doesn't have MANAGE permission
    },
    user: {
      canRead: hasPermission(PERMISSIONS.USER_READ),
      canCreate: hasPermission(PERMISSIONS.USER_CREATE),
      canUpdate: hasPermission(PERMISSIONS.USER_UPDATE),
      canDelete: hasPermission(PERMISSIONS.USER_DELETE),
      canManage: hasPermission(PERMISSIONS.USER_MANAGE),
    },
    role: {
      canRead: hasPermission(PERMISSIONS.ROLE_READ),
      canCreate: hasPermission(PERMISSIONS.ROLE_CREATE),
      canUpdate: hasPermission(PERMISSIONS.ROLE_UPDATE),
      canDelete: hasPermission(PERMISSIONS.ROLE_DELETE),
      canManage: hasPermission(PERMISSIONS.ROLE_MANAGE),
    },
    organization: {
      canRead: hasPermission(PERMISSIONS.ORGANIZATION_READ),
      canCreate: hasPermission(PERMISSIONS.ORGANIZATION_CREATE),
      canUpdate: hasPermission(PERMISSIONS.ORGANIZATION_UPDATE),
      canDelete: hasPermission(PERMISSIONS.ORGANIZATION_DELETE),
      canManage: hasPermission(PERMISSIONS.ORGANIZATION_MANAGE),
    },
    widget: {
      canRead: hasPermission(PERMISSIONS.WIDGET_READ),
      canCreate: false, // Widget doesn't have CREATE permission
      canUpdate: false, // Widget doesn't have UPDATE permission
      canDelete: false, // Widget doesn't have DELETE permission
      canManage: hasPermission(PERMISSIONS.WIDGET_MANAGE),
    },
    analytics: {
      canRead: hasPermission(PERMISSIONS.ANALYTICS_READ),
      canCreate: false, // Analytics doesn't have CREATE permission
      canUpdate: false, // Analytics doesn't have UPDATE permission
      canDelete: false, // Analytics doesn't have DELETE permission
      canManage: false, // Analytics doesn't have MANAGE permission
    },
    settings: {
      canRead: hasPermission(PERMISSIONS.SYSTEM_SETTINGS_READ),
      canCreate: false, // Settings doesn't have CREATE permission
      canUpdate: hasPermission(PERMISSIONS.SYSTEM_SETTINGS_UPDATE),
      canDelete: hasPermission(PERMISSIONS.SYSTEM_SETTINGS_DELETE),
      canManage: false, // Settings doesn't have MANAGE permission
    },
  }

  return permissionMap[entity]
}
