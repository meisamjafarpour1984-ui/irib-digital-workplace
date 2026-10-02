/**
 * IRIB Digital Workplace Platform - Mobile Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface MobileDevice {
  id: string
  deviceId: string
  platform: 'iOS' | 'Android'
  userId: string
  userName: string
  status: 'active' | 'inactive' | 'blocked'
  lastActive: string
  pushEnabled: boolean
  appVersion?: string
}

export interface QrToken {
  id: string
  token: string
  userId: string
  userName: string
  status: 'active' | 'used' | 'expired'
  createdAt: string
  expiresAt: string
  usedAt?: string
}

export interface PushSubscription {
  id: string
  deviceId: string
  endpoint: string
  status: 'active' | 'inactive'
  subscribedAt: string
}

export interface MobileStats {
  totalDevices: number
  activeDevices: number
  totalQrTokens: number
  activeQrTokens: number
  totalPushSubscriptions: number
  activePushSubscriptions: number
}

export function useMobile() {
  const [devices, setDevices] = useState<MobileDevice[]>([])
  const [qrTokens, setQrTokens] = useState<QrToken[]>([])
  const [pushSubscriptions, setPushSubscriptions] = useState<PushSubscription[]>([])
  const [stats, setStats] = useState<MobileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async () => {
    try {
      const data = await apiClient.get<MobileDevice[]>('/mobile/devices')
      setDevices(data || [])
    } catch (err) {
      console.error('Error fetching devices:', err)
    }
  }

  const fetchQrTokens = async () => {
    try {
      const data = await apiClient.get<QrToken[]>('/mobile/qr-tokens')
      setQrTokens(data || [])
    } catch (err) {
      console.error('Error fetching QR tokens:', err)
    }
  }

  const fetchPushSubscriptions = async () => {
    try {
      const data = await apiClient.get<PushSubscription[]>('/mobile/push-subscriptions')
      setPushSubscriptions(data || [])
    } catch (err) {
      console.error('Error fetching push subscriptions:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<MobileStats>('/mobile/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching mobile stats:', err)
    }
  }

  const createQrToken = async (userId: string) => {
    try {
      const result = await apiClient.post<QrToken>('/mobile/qr-tokens', { userId })
      setQrTokens([...qrTokens, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR token')
      throw err
    }
  }

  const revokeQrToken = async (tokenId: string) => {
    try {
      await apiClient.delete(`/mobile/qr-tokens/${tokenId}`)
      setQrTokens(qrTokens.filter((t) => t.id !== tokenId))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke QR token')
      throw err
    }
  }

  const blockDevice = async (deviceId: string) => {
    try {
      const result = await apiClient.post<MobileDevice>(`/mobile/devices/${deviceId}/block`)
      setDevices(devices.map((d) => (d.id === deviceId ? result : d)))
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block device')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchDevices(), fetchQrTokens(), fetchPushSubscriptions(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    devices,
    qrTokens,
    pushSubscriptions,
    stats,
    loading,
    error,
    fetchDevices,
    fetchQrTokens,
    fetchPushSubscriptions,
    fetchStats,
    createQrToken,
    revokeQrToken,
    blockDevice,
  }
}
