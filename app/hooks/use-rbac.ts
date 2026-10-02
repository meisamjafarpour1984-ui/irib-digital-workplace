/**
 * IRIB Digital Workplace Platform - RBAC Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Role {
  id: string
  code: string
  name: string | { fa: string; en: string }
  description: string
  permissions: string[]
  isSystem?: boolean
  userCount?: number
}

export interface Permission {
  id: string
  code: string
  name: string | { fa: string; en: string }
  description: string
  module: string
  entity?: string
  action?: string
}

export interface RolePermissionAssignment {
  roleId: string
  permissionId: string
}

export function useRbac() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rolePermissions, setRolePermissions] = useState<RolePermissionAssignment[]>([])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<Role[]>('/roles')
      setRoles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching roles:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const data = await apiClient.get<Permission[]>('/permissions')
      setPermissions(data || [])
    } catch (err) {
      console.error('Error fetching permissions:', err)
    }
  }

  const createRole = async (roleData: {
    code: string
    name: { fa: string; en: string }
    description: string
    permissions: string[]
  }) => {
    try {
      const newRole = await apiClient.post<Role>('/roles', roleData)
      setRoles([...roles, newRole])
      return newRole
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
      throw err
    }
  }

  const updateRole = async (id: string, roleData: Partial<Role>) => {
    try {
      const updatedRole = await apiClient.put<Role>(`/roles/${id}`, roleData)
      setRoles(roles.map((r) => (r.id === id ? updatedRole : r)))
      return updatedRole
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      throw err
    }
  }

  const deleteRole = async (id: string) => {
    try {
      await apiClient.delete(`/roles/${id}`)
      setRoles(roles.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
      throw err
    }
  }

  const assignPermission = async (roleId: string, permissionId: string) => {
    await apiClient.post(`/roles/${roleId}/permissions`, { permissionId })
    setRolePermissions((current) => [...current, { roleId, permissionId }])
  }

  const revokePermission = async (roleId: string, permissionId: string) => {
    await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`)
    setRolePermissions((current) =>
      current.filter(
        (assignment) => assignment.roleId !== roleId || assignment.permissionId !== permissionId
      )
    )
  }

  useEffect(() => {
    void fetchRoles()
    void fetchPermissions()
  }, [])

  return {
    roles,
    permissions,
    loading,
    error,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    rolePermissions,
    assignPermission,
    revokePermission,
  }
}
