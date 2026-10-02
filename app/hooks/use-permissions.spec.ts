/**
 * IRIB Digital Workplace Platform - Permissions Hook Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePermissions } from '@/app/hooks/use-permissions'

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

// Mock auth-store
vi.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: 'user-123',
      roles: ['USER'],
      permissions: ['User.READ', 'Content.READ'],
    },
  })),
}))

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasPermission', () => {
    it('should return true when user has the permission', () => {
      const { result } = usePermissions()
      expect(result.hasPermission('User.READ')).toBe(true)
    })

    it('should return false when user does not have the permission', () => {
      const { result } = usePermissions()
      expect(result.hasPermission('User.CREATE')).toBe(false)
    })

    it('should return false when user is not authenticated', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: null,
        })),
      }))
      const { result } = usePermissions()
      expect(result.hasPermission('User.READ')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one of the permissions', () => {
      const { result } = usePermissions()
      expect(result.hasAnyPermission(['User.READ', 'User.CREATE'])).toBe(true)
    })

    it('should return false when user has none of the permissions', () => {
      const { result } = usePermissions()
      expect(result.hasAnyPermission(['User.CREATE', 'User.DELETE'])).toBe(false)
    })

    it('should handle empty array', () => {
      const { result } = usePermissions()
      expect(result.hasAnyPermission([])).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('should return true when user has all of the permissions', () => {
      const { result } = usePermissions()
      expect(result.hasAllPermissions(['User.READ', 'Content.READ'])).toBe(true)
    })

    it('should return false when user does not have all permissions', () => {
      const { result } = usePermissions()
      expect(result.hasAllPermissions(['User.READ', 'User.CREATE'])).toBe(false)
    })

    it('should handle empty array', () => {
      const { result } = usePermissions()
      expect(result.hasAllPermissions([])).toBe(true)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const { result } = usePermissions()
      expect(result.hasRole('USER')).toBe(true)
    })

    it('should return false when user does not have the role', () => {
      const { result } = usePermissions()
      expect(result.hasRole('ADMIN')).toBe(false)
    })

    it('should return false when user is not authenticated', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: null,
        })),
      }))
      const { result } = usePermissions()
      expect(result.hasRole('USER')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('should return true when user has at least one of the roles', () => {
      const { result } = usePermissions()
      expect(result.hasAnyRole(['USER', 'ADMIN'])).toBe(true)
    })

    it('should return false when user has none of the roles', () => {
      const { result } = usePermissions()
      expect(result.hasAnyRole(['ADMIN', 'MANAGER'])).toBe(false)
    })

    it('should handle empty array', () => {
      const { result } = usePermissions()
      expect(result.hasAnyRole([])).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true when user has ADMIN role', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: {
            roles: ['ADMIN'],
          },
        })),
      }))
      const { result } = usePermissions()
      expect(result.isAdmin()).toBe(true)
    })

    it('should return false when user does not have ADMIN role', () => {
      const { result } = usePermissions()
      expect(result.isAdmin()).toBe(false)
    })
  })

  describe('isPortalManager', () => {
    it('should return true when user has PORTAL_MANAGER role', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: {
            roles: ['PORTAL_MANAGER'],
          },
        })),
      }))
      const { result } = usePermissions()
      expect(result.isPortalManager()).toBe(true)
    })

    it('should return false when user does not have PORTAL_MANAGER role', () => {
      const { result } = usePermissions()
      expect(result.isPortalManager()).toBe(false)
    })
  })

  describe('isDepartmentOfficer', () => {
    it('should return true when user has DEPARTMENT_OFFICER role', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: {
            roles: ['DEPARTMENT_OFFICER'],
          },
        })),
      }))
      const { result } = usePermissions()
      expect(result.isDepartmentOfficer()).toBe(true)
    })

    it('should return false when user does not have DEPARTMENT_OFFICER role', () => {
      const { result } = usePermissions()
      expect(result.isDepartmentOfficer()).toBe(false)
    })
  })

  describe('useEntityPermissions', () => {
    it('should return correct permissions for User entity', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: {
            permissions: ['User.READ', 'User.UPDATE', 'Content.READ'],
          },
        })),
      }))
      const { result } = usePermissions()
      const entityPerms = result.useEntityPermissions('User')

      expect(entityPerms.canRead).toBe(true)
      expect(entityPerms.canCreate).toBe(false)
      expect(entityPerms.canUpdate).toBe(true)
      expect(entityPerms.canDelete).toBe(false)
    })

    it('should return all false for entity with no permissions', () => {
      vi.doMock('@/lib/stores/auth-store', () => ({
        useAuthStore: vi.fn(() => ({
          user: {
            permissions: ['Content.READ'],
          },
        })),
      }))
      const { result } = usePermissions()
      const entityPerms = result.useEntityPermissions('User')

      expect(entityPerms.canRead).toBe(false)
      expect(entityPerms.canCreate).toBe(false)
      expect(entityPerms.canUpdate).toBe(false)
      expect(entityPerms.canDelete).toBe(false)
    })
  })
})
