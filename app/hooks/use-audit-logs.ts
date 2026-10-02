/**
 * IRIB Digital Workplace Platform - Audit Logs Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  entity: string
  entityId: string
  details: Record<string, unknown>
  ipAddress: string
  userAgent: string
  timestamp: string
  createdAt: string
  user?: { id: string; name: string }
}

export interface AuditStats {
  totalLogs: number
  actionsByType: Record<string, number>
  topUsers: Array<{ userId: string; userName: string; actionCount: number }>
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async (params?: {
    userId?: string
    action?: string
    entity?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<AuditLog[]>('/audit/logs', {
        params: {
          ...(params?.userId && { userId: params.userId }),
          ...(params?.action && { action: params.action }),
          ...(params?.entity && { entity: params.entity }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit }),
        },
      })

      setLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<AuditStats>('/audit/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching audit stats:', err)
    }
  }

  const exportLogs = async (params?: {
    format?: 'json' | 'csv'
    userId?: string
    action?: string
    entity?: string
    startDate?: string
    endDate?: string
  }) => {
    try {
      const response = await apiClient.get<Blob>('/audit/export', {
        params: {
          ...(params?.userId && { userId: params.userId }),
          ...(params?.action && { action: params.action }),
          ...(params?.entity && { entity: params.entity }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(response)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export logs')
      throw err
    }
  }

  useEffect(() => {
    void fetchLogs()
    void fetchStats()
  }, [])

  return {
    logs,
    stats,
    loading,
    error,
    fetchLogs,
    fetchStats,
    exportLogs,
  }
}
