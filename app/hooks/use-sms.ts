/**
 * IRIB Digital Workplace Platform - SMS Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface SmsCampaign {
  id: string
  name: string
  message: string
  recipientCount: number
  sentCount: number
  sent?: number
  delivered?: number
  failed?: number
  status: 'draft' | 'pending' | 'sending' | 'completed' | 'failed'
  scheduledAt?: string
  sentAt?: string
  createdAt: string
}

export interface SmsTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  createdAt: string
}

export interface SmsStats {
  totalCampaigns: number
  totalSent: number
  totalFailed: number
  successRate: number
  avgDeliveryTime: number
}

export interface SmsQueueItem {
  id: string
  phoneNumber: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  attempts: number
  createdAt: string
  sentAt?: string
}

export function useSms() {
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([])
  const [templates, setTemplates] = useState<SmsTemplate[]>([])
  const [queue, setQueue] = useState<SmsQueueItem[]>([])
  const [stats, setStats] = useState<SmsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      // Campaign endpoint doesn't exist in backend, using empty array
      setCampaigns([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns')
      console.error('Error fetching campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get<SmsTemplate[]>('/sms/templates')
      setTemplates(data || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
      // Template service returns message, set empty array
      setTemplates([])
    }
  }

  const fetchQueue = async () => {
    try {
      // Queue endpoint doesn't exist in backend, using empty array
      setQueue([])
    } catch (err) {
      console.error('Error fetching queue:', err)
    }
  }

  const fetchStats = async () => {
    try {
      // Stats endpoint doesn't exist in backend, use provider status
      setStats({
        totalCampaigns: 0,
        totalSent: 0,
        totalFailed: 0,
        successRate: 0,
        avgDeliveryTime: 0,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setStats({
        totalCampaigns: 0,
        totalSent: 0,
        totalFailed: 0,
        successRate: 0,
        avgDeliveryTime: 0,
      })
    }
  }

  const createCampaign = async (data: {
    name: string
    message: string
    recipients: string[]
    scheduledAt?: string
  }) => {
    try {
      setSending(true)
      setError(null)
      // Campaign endpoint doesn't exist, use send-bulk instead
      await apiClient.post('/sms/send-bulk', {
        recipients: data.recipients,
        message: data.message,
      })
      await fetchStats()
      return {
        id: 'temp',
        name: data.name,
        message: data.message,
        recipientCount: data.recipients.length,
        sentCount: 0,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
      throw err
    } finally {
      setSending(false)
    }
  }

  const createTemplate = async (data: { name: string; content: string; variables: string[] }) => {
    try {
      // Template endpoint exists but returns "not available" message
      const result = await apiClient.post('/sms/templates', data)
      await fetchTemplates()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
      throw err
    }
  }

  const sendSms = async (phoneNumber: string, message: string) => {
    try {
      setSending(true)
      setError(null)
      await apiClient.post('/sms/send', { recipient: phoneNumber, message })
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS')
      throw err
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchCampaigns(), fetchTemplates(), fetchQueue(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    campaigns,
    templates,
    queue,
    stats,
    loading,
    error,
    sending,
    fetchCampaigns,
    fetchTemplates,
    fetchQueue,
    fetchStats,
    createCampaign,
    createTemplate,
    sendSms,
  }
}
