/**
 * IRIB Digital Workplace Platform - Integrations Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Connector {
  id: string
  name: string
  type: 'REST' | 'SOAP' | 'LDAP' | 'FTP' | 'DATABASE'
  status: 'active' | 'inactive' | 'error'
  lastSync: string
  baseUrl: string
  config?: Record<string, unknown>
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggered?: string
  secret?: string
}

export interface SyncHistory {
  id: string
  connectorId: string
  connectorName: string
  status: 'success' | 'error' | 'partial'
  recordsProcessed: number
  startedAt: string
  completedAt?: string
  errorMessage?: string
  connector?: string
  type?: 'full' | 'incremental'
  startTime?: string
  duration?: string
}

export interface IntegrationStats {
  totalConnectors: number
  activeConnectors: number
  totalWebhooks: number
  activeWebhooks: number
  totalSyncs: number
}

export function useIntegrations() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [stats, setStats] = useState<IntegrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConnectors = async () => {
    try {
      const data = await apiClient.get<Connector[]>('/integrations/connectors')
      setConnectors(data || [])
    } catch (err) {
      console.error('Error fetching connectors:', err)
    }
  }

  const fetchWebhooks = async () => {
    try {
      const data = await apiClient.get<Webhook[]>('/integrations/webhooks')
      setWebhooks(data || [])
    } catch (err) {
      console.error('Error fetching webhooks:', err)
    }
  }

  const fetchSyncHistory = async () => {
    try {
      const data = await apiClient.get<SyncHistory[]>('/integrations/sync-history')
      setSyncHistory(data || [])
    } catch (err) {
      console.error('Error fetching sync history:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<IntegrationStats>('/integrations/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching integration stats:', err)
    }
  }

  const createConnector = async (data: {
    name: string
    type: string
    baseUrl: string
    config?: Record<string, unknown>
  }) => {
    try {
      const result = await apiClient.post<Connector>('/integrations/connectors', data)
      setConnectors([...connectors, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connector')
      throw err
    }
  }

  const createWebhook = async (data: {
    name: string
    url: string
    events: string[]
    secret?: string
  }) => {
    try {
      const result = await apiClient.post<Webhook>('/integrations/webhooks', data)
      setWebhooks([...webhooks, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create webhook')
      throw err
    }
  }

  const triggerSync = async (connectorId: string) => {
    try {
      await apiClient.post(`/integrations/connectors/${connectorId}/sync`)
      await fetchSyncHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger sync')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchConnectors(), fetchWebhooks(), fetchSyncHistory(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    connectors,
    webhooks,
    syncHistory,
    stats,
    loading,
    error,
    fetchConnectors,
    fetchWebhooks,
    fetchSyncHistory,
    fetchStats,
    createConnector,
    createWebhook,
    triggerSync,
  }
}
