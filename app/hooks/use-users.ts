/**
 * IRIB Digital Workplace Platform - User Management Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface User {
  id: string
  personnelCode: string
  name: string
  nameFa?: string
  email?: string
  mobile?: string
  status: string
  departments?: Array<{
    department: {
      id: string
      name: string
    }
  }>
  roles?: Array<{
    role: {
      id: string
      code: string
      name: string
    }
  }>
  createdAt: string
}

export interface UserStats {
  total: number
  active: number
  disabled: number
  byRole: Array<{ roleId: string; count: number }>
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchUsers = async (params?: {
    status?: string
    departmentId?: string
    search?: string
    roleCode?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<{ items: User[]; pagination: typeof pagination }>('/users', {
        params: {
          page: params?.page || pagination.page,
          limit: params?.limit || pagination.limit,
          ...(params?.status && { status: params.status }),
          ...(params?.departmentId && { departmentId: params.departmentId }),
          ...(params?.search && { search: params.search }),
          ...(params?.roleCode && { roleCode: params.roleCode }),
        },
      })

      setUsers(data.items || [])
      setPagination(data.pagination || pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<UserStats>('/users/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching user stats:', err)
    }
  }

  const createUser = async (userData: {
    personnelCode: string
    name: string
    nameFa?: string
    email?: string
    mobile?: string
    departmentIds?: string[]
  }) => {
    try {
      const newUser = await apiClient.post<User>('/users', userData)
      setUsers([...users, newUser])
      await fetchStats()
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await apiClient.put<User>(`/users/${id}`, userData)
      setUsers(users.map((u) => (u.id === id ? updatedUser : u)))
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`)
      setUsers(users.filter((u) => u.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      throw err
    }
  }

  const toggleUserStatus = async (id: string, status: string) => {
    try {
      const updatedUser = await apiClient.put<User>(`/users/${id}/status`, { status })
      setUsers(users.map((u) => (u.id === id ? updatedUser : u)))
      await fetchStats()
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status')
      throw err
    }
  }

  useEffect(() => {
    void fetchUsers()
    void fetchStats()
  }, [])

  return {
    users,
    stats,
    loading,
    error,
    pagination,
    fetchUsers,
    fetchStats,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  }
}
