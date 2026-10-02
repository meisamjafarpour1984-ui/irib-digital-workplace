/**
 * IRIB Digital Workplace Platform - Users Hook Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUsers } from '@/app/hooks/use-users'

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        {
          id: '1',
          personnelCode: '123456',
          name: 'Test User 1',
          status: 'ACTIVE',
          departments: [],
          roles: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          personnelCode: '789012',
          name: 'Test User 2',
          status: 'ACTIVE',
          departments: [],
          roles: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      const mockResponse = {
        items: mockUsers,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      }

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await result.current.fetchUsers()
      })

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/users', {
        params: {
          page: 1,
          limit: 20,
        },
      })
      expect(result.current.users).toEqual(mockUsers)
      expect(result.current.pagination).toEqual(mockResponse.pagination)
    })

    it('should handle fetch users error', async () => {
      const errorMessage = 'Failed to fetch users'
      ;(require('@/lib/api-client').apiClient.get as any).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await result.current.fetchUsers()
      })

      expect(result.current.error).toBe(errorMessage)
    })

    it('should fetch users with filters', async () => {
      const mockResponse = {
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      }

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await result.current.fetchUsers({
          status: 'ACTIVE',
          departmentId: 'dept-123',
          search: 'test',
          roleCode: 'ADMIN',
        })
      })

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/users', {
        params: {
          page: 1,
          limit: 20,
          status: 'ACTIVE',
          departmentId: 'dept-123',
          search: 'test',
          roleCode: 'ADMIN',
        },
      })
    })
  })

  describe('fetchStats', () => {
    it('should fetch user stats successfully', async () => {
      const mockStats = {
        total: 100,
        active: 80,
        disabled: 15,
        byRole: [
          { roleId: 'role-1', count: 50 },
          { roleId: 'role-2', count: 30 },
        ],
      }

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await result.current.fetchStats()
      })

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/users/stats')
      expect(result.current.stats).toEqual(mockStats)
    })

    it('should handle fetch stats error gracefully', async () => {
      ;(require('@/lib/api-client').apiClient.get as any).mockRejectedValue(
        new Error('Failed to fetch user stats')
      )

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await result.current.fetchStats()
      })

      // Should not throw error, just log it
      expect(result.current.stats).toBeNull()
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const newUser = {
        id: '3',
        personnelCode: '111222',
        name: 'New User',
        status: 'ACTIVE',
        departments: [],
        roles: [],
        createdAt: '2024-01-01T00:00:00Z',
      }

      const userData = {
        personnelCode: '111222',
        name: 'New User',
        email: 'new@example.com',
        mobile: '09123456789',
      }

      ;(require('@/lib/api-client').apiClient.post as any).mockResolvedValue(newUser)

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        const createdUser = await result.current.createUser(userData)
        expect(createdUser).toEqual(newUser)
      })

      expect(require('@/lib/api-client').apiClient.post).toHaveBeenCalledWith('/users', userData)
    })

    it('should handle create user error', async () => {
      const errorMessage = 'Failed to create user'
      const userData = {
        personnelCode: '111222',
        name: 'New User',
      }

      ;(require('@/lib/api-client').apiClient.post as any).mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await expect(result.current.createUser(userData)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updatedUser = {
        id: '1',
        personnelCode: '123456',
        name: 'Updated User',
        status: 'ACTIVE',
        departments: [],
        roles: [],
        createdAt: '2024-01-01T00:00:00Z',
      }

      const updateData = {
        name: 'Updated User',
      }

      ;(require('@/lib/api-client').apiClient.put as any).mockResolvedValue(updatedUser)

      const { result } = renderHook(() => useUsers())
      // Set initial users
      result.current.users = [
        {
          id: '1',
          personnelCode: '123456',
          name: 'Test User',
          status: 'ACTIVE',
          departments: [],
          roles: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      await act(async () => {
        const user = await result.current.updateUser('1', updateData)
        expect(user).toEqual(updatedUser)
      })

      expect(require('@/lib/api-client').apiClient.put).toHaveBeenCalledWith('/users/1', updateData)
      expect(result.current.users[0].name).toBe('Updated User')
    })

    it('should handle update user error', async () => {
      const errorMessage = 'Failed to update user'
      const updateData = {
        name: 'Updated User',
      }

      ;(require('@/lib/api-client').apiClient.put as any).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await expect(result.current.updateUser('1', updateData)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      ;(require('@/lib/api-client').apiClient.delete as any).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUsers())
      // Set initial users
      result.current.users = [
        {
          id: '1',
          personnelCode: '123456',
          name: 'Test User',
          status: 'ACTIVE',
          departments: [],
          roles: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      await act(async () => {
        await result.current.deleteUser('1')
      })

      expect(require('@/lib/api-client').apiClient.delete).toHaveBeenCalledWith('/users/1')
      expect(result.current.users).toHaveLength(0)
    })

    it('should handle delete user error', async () => {
      const errorMessage = 'Failed to delete user'

      ;(require('@/lib/api-client').apiClient.delete as any).mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useUsers())
      await act(async () => {
        await expect(result.current.deleteUser('1')).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('initial fetch', () => {
    it('should fetch users and stats on mount', async () => {
      const mockUsers = {
        items: [
          {
            id: '1',
            personnelCode: '123456',
            name: 'Test User',
            status: 'ACTIVE',
            departments: [],
            roles: [],
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }

      const mockStats = {
        total: 1,
        active: 1,
        disabled: 0,
        byRole: [],
      }

      ;(require('@/lib/api-client').apiClient.get as any)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useUsers())

      // Wait for initial fetch to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/users', {
        params: {
          page: 1,
          limit: 20,
        },
      })
      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/users/stats')
    })
  })
})
