/**
 * IRIB Digital Workplace Platform - User Settings Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    inbox: boolean
  }
  language: 'fa' | 'en'
  fontSize: 'small' | 'medium' | 'large'
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sms: false,
      inbox: true,
    },
    language: 'fa',
    fontSize: 'medium',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Convert nested object to key-value pairs
  const flattenSettings = (obj: UserSettings): Record<string, string | boolean> => {
    const result: Record<string, string | boolean> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [subKey, subValue] of Object.entries(value)) {
          result[`${key}.${subKey}`] = subValue as string | boolean
        }
      } else {
        result[key] = value as string | boolean
      }
    }
    return result
  }

  // Convert key-value pairs to nested object
  const unflattenSettings = (obj: Record<string, string | boolean>): UserSettings => {
    const result: Record<string, Record<string, string | boolean> | string | boolean> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        if (!result[parent] || typeof result[parent] !== 'object') {
          result[parent] = {}
        }
        ;(result[parent] as Record<string, string | boolean>)[child] = value
      } else {
        result[key] = value
      }
    }
    return result as unknown as UserSettings
  }

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all user settings
      const data = await apiClient.get<Array<{ key: string; value: string | boolean }>>(
        '/admin/settings',
        {
          params: { category: 'USER' },
        }
      )

      // Convert to nested object
      const keyValueData: Record<string, string | boolean> = {}
      data.forEach((item) => {
        keyValueData[item.key] = item.value
      })

      setSettings(unflattenSettings(keyValueData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      console.error('Error fetching user settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setSaving(true)
      setError(null)

      // Merge with current settings
      const mergedSettings = { ...settings, ...newSettings }

      // Convert to key-value pairs
      const keyValueData = flattenSettings(mergedSettings)

      // Send each setting to backend
      const promises = Object.entries(keyValueData).map(([key, value]) =>
        apiClient.post('/admin/settings', {
          key,
          category: 'USER',
          value,
          type: typeof value,
          isPublic: false,
          isEditable: true,
        })
      )

      await Promise.all(promises)

      setSettings(mergedSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    await updateSettings({ theme })
  }

  const updateNotifications = async (notifications: Partial<UserSettings['notifications']>) => {
    await updateSettings({
      notifications: { ...settings.notifications, ...notifications },
    })
  }

  const updateLanguage = async (language: 'fa' | 'en') => {
    await updateSettings({ language })
  }

  const updateFontSize = async (fontSize: 'small' | 'medium' | 'large') => {
    await updateSettings({ fontSize })
  }

  useEffect(() => {
    void fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    saving,
    fetchSettings,
    updateSettings,
    updateTheme,
    updateNotifications,
    updateLanguage,
    updateFontSize,
  }
}
