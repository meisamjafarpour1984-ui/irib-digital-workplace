/**
 * IRIB Digital Workplace Platform - Theme Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Theme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: string
  fontSize: string
  customCSS?: string
  isActive: boolean
}

export interface ThemeToken extends Theme {
  category: string
  isDefault: boolean
}

export function useTheme() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchThemes = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<Theme[]>('/theme')
      setThemes(data || [])
      setActiveTheme(data.find((t) => t.isActive) || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching themes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTheme = async (themeData: Omit<Theme, 'id' | 'isActive'>) => {
    try {
      const newTheme = await apiClient.post<Theme>('/theme', themeData)
      setThemes([...themes, newTheme])
      return newTheme
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme')
      throw err
    }
  }

  const updateTheme = async (id: string, themeData: Partial<Theme>) => {
    try {
      const updatedTheme = await apiClient.put<Theme>(`/theme/${id}`, themeData)
      setThemes(themes.map((t) => (t.id === id ? updatedTheme : t)))
      if (updatedTheme.isActive) {
        setActiveTheme(updatedTheme)
      }
      return updatedTheme
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme')
      throw err
    }
  }

  const setActiveThemeById = async (id: string) => {
    try {
      await apiClient.put(`/theme/${id}/activate`)
      setThemes(themes.map((t) => ({ ...t, isActive: t.id === id })))
      const theme = themes.find((t) => t.id === id)
      if (theme) setActiveTheme(theme)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate theme')
      throw err
    }
  }

  const deleteTheme = async (id: string) => {
    try {
      await apiClient.delete(`/theme/${id}`)
      setThemes(themes.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete theme')
      throw err
    }
  }

  useEffect(() => {
    void fetchThemes()
  }, [])

  const tokens: ThemeToken[] = themes.map((theme) => ({
    ...theme,
    category: 'theme',
    isDefault: false,
  }))
  const stats = {
    totalTokens: tokens.length,
    activeTokens: tokens.filter((token) => token.isActive).length,
  }
  const activateTheme = setActiveThemeById
  const exportTheme = async () => {
    await apiClient.get<Blob>('/theme/export', { responseType: 'blob' })
  }

  return {
    themes,
    activeTheme,
    loading,
    error,
    fetchThemes,
    createTheme,
    updateTheme,
    setActiveThemeById,
    deleteTheme,
    tokens,
    stats,
    activateTheme,
    exportTheme,
  }
}
