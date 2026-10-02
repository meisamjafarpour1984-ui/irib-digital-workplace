/**
 * IRIB Digital Workplace Platform - Workspaces Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Workspace {
  id: string
  name: string
  owner: string
  ownerId: string
  members: number
  memberIds: string[]
  lastActivity: string
  status: 'active' | 'archived'
  widgets: number
  createdAt: string
  updatedAt: string
}

export interface WorkspaceStats {
  totalWorkspaces: number
  activeWorkspaces: number
  archivedWorkspaces: number
  totalMembers: number
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [stats, setStats] = useState<WorkspaceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkspaces = async (params?: { status?: 'active' | 'archived'; search?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search }),
      })

      const data = await apiClient.get<Workspace[]>(`/workspaces?${queryParams}`)
      setWorkspaces(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspaces')
      console.error('Error fetching workspaces:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<WorkspaceStats>('/workspaces/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching workspace stats:', err)
    }
  }

  const createWorkspace = async (data: { name: string; memberIds: string[] }) => {
    try {
      const result = await apiClient.post<Workspace>('/workspaces', data)
      setWorkspaces([...workspaces, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
      throw err
    }
  }

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    try {
      const result = await apiClient.put<Workspace>(`/workspaces/${id}`, data)
      setWorkspaces(workspaces.map((w) => (w.id === id ? result : w)))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workspace')
      throw err
    }
  }

  const deleteWorkspace = async (id: string) => {
    try {
      await apiClient.delete(`/workspaces/${id}`)
      setWorkspaces(workspaces.filter((w) => w.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace')
      throw err
    }
  }

  const archiveWorkspace = async (id: string) => {
    try {
      const result = await apiClient.post<Workspace>(`/workspaces/${id}/archive`)
      setWorkspaces(workspaces.map((w) => (w.id === id ? result : w)))
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive workspace')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchWorkspaces(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    workspaces,
    stats,
    loading,
    error,
    fetchWorkspaces,
    fetchStats,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    archiveWorkspace,
  }
}
