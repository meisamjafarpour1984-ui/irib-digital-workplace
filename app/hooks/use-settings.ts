/**
 * IRIB Digital Workplace Platform - System Settings Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface SystemSetting {
  id: string
  key: string
  category: string
  value: string | number | boolean | null
  type: string
  description?: string
  isPublic: boolean
  isEditable: boolean
  updatedAt: string
  updatedBy?: string
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async (category?: string, isPublic?: boolean) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (isPublic !== undefined) params.append('isPublic', isPublic.toString())

      const data = await apiClient.get<SystemSetting[]>(`/admin/settings?${params}`)
      setSettings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSetting = async (key: string) => {
    try {
      const data = await apiClient.get<SystemSetting>(`/admin/settings/${key}`)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch setting')
      throw err
    }
  }

  const updateSetting = async (data: {
    key: string
    category: string
    value: string | number | boolean | null
    type?: string
    description?: string
    isPublic?: boolean
    isEditable?: boolean
    updatedBy?: string
  }) => {
    try {
      setSaving(true)
      setError(null)
      const result = await apiClient.post<SystemSetting>('/admin/settings', data)
      await fetchSettings()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const initializeSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      const result = await apiClient.post('/admin/settings/initialize')
      await fetchSettings()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize settings')
      throw err
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    saving,
    fetchSettings,
    getSetting,
    updateSetting,
    initializeSettings,
  }
}
