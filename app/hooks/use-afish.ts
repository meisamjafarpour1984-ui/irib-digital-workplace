/**
 * IRIB Digital Workplace Platform - Afish Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface AfishRecord {
  id: string
  recordNumber: string
  title: string
  status: 'draft' | 'pending' | 'approved' | 'printed' | 'locked'
  createdAt: string
  rows: number
  approvedBy?: string
  approvedAt?: string
  data: string[][]
}

export interface AfishTemplate {
  id: string
  name: string
  description: string
  columnCount: number
  lastUsed?: string
  createdAt: string
}

export interface AfishStats {
  totalRecords: number
  pendingApproval: number
  printed: number
  totalTemplates: number
}

export function useAfish() {
  const [records, setRecords] = useState<AfishRecord[]>([])
  const [templates, setTemplates] = useState<AfishTemplate[]>([])
  const [stats, setStats] = useState<AfishStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async (params?: { status?: string; search?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search }),
      })

      const data = await apiClient.get<AfishRecord[]>(`/afish/records?${queryParams}`)
      setRecords(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch afish records')
      console.error('Error fetching afish records:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get<AfishTemplate[]>('/afish/templates')
      setTemplates(data || [])
    } catch (err) {
      console.error('Error fetching afish templates:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<AfishStats>('/afish/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching afish stats:', err)
    }
  }

  const createRecord = async (data: {
    title: string
    templateId?: string
    initialData: string[][]
  }) => {
    try {
      const result = await apiClient.post<AfishRecord>('/afish/records', data)
      setRecords([...records, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create afish record')
      throw err
    }
  }

  const updateRecord = async (id: string, data: Partial<AfishRecord>) => {
    try {
      const result = await apiClient.put<AfishRecord>(`/afish/records/${id}`, data)
      setRecords(records.map((r) => (r.id === id ? result : r)))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update afish record')
      throw err
    }
  }

  const approveRecord = async (id: string) => {
    try {
      const result = await apiClient.post<AfishRecord>(`/afish/records/${id}/approve`)
      setRecords(records.map((r) => (r.id === id ? result : r)))
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve afish record')
      throw err
    }
  }

  const lockRecord = async (id: string) => {
    try {
      const result = await apiClient.post<AfishRecord>(`/afish/records/${id}/lock`)
      setRecords(records.map((r) => (r.id === id ? result : r)))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock afish record')
      throw err
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      await apiClient.delete(`/afish/records/${id}`)
      setRecords(records.filter((r) => r.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete afish record')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchRecords(), fetchTemplates(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    records,
    templates,
    stats,
    loading,
    error,
    fetchRecords,
    fetchTemplates,
    fetchStats,
    createRecord,
    updateRecord,
    approveRecord,
    lockRecord,
    deleteRecord,
  }
}
