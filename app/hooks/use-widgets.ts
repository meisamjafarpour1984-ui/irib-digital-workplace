/**
 * IRIB Digital Workplace Platform - Widgets Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Widget {
  id: string
  key: string
  name: string
  category: string
  description: string
  componentPath: string
  defaultSize: { cols: number; rows: number }
  resizable: boolean
  draggable: boolean
  ssr: boolean
  requiredPermissions: string[]
  createdAt: string
  updatedAt: string
}

export interface Layout {
  id: string
  name: string
  description: string
  grid: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface WidgetStats {
  totalWidgets: number
  activeWidgets: number
  totalLayouts: number
  categories: number
}

export interface WidgetManifest {
  widgetKey: string
  name: string | Record<string, string>
  category?: string
  componentPath?: string
  defaultSize?: { cols: number; rows: number }
  resizable?: boolean
  draggable?: boolean
  ssr?: boolean
  requiredPermissions?: string[]
  createdAt?: string
  updatedAt?: string
}

export function useWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [stats, setStats] = useState<WidgetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWidgets = async () => {
    try {
      const data = await apiClient.get<WidgetManifest[]>('/widget-engine/registry')
      // Widget registry returns array of WidgetManifest from database
      const widgetList = (data || []).map((w: WidgetManifest) => ({
        id: w.widgetKey,
        key: w.widgetKey,
        name: typeof w.name === 'string' ? w.name : w.name?.fa || w.name?.en || w.widgetKey,
        category: w.category || 'general',
        description: '',
        componentPath: w.componentPath || '',
        defaultSize: w.defaultSize || { cols: 6, rows: 4 },
        resizable: w.resizable !== false,
        draggable: w.draggable !== false,
        ssr: w.ssr !== false,
        requiredPermissions: w.requiredPermissions || [],
        isActive: true,
        createdAt: w.createdAt || new Date().toISOString(),
        updatedAt: w.updatedAt || new Date().toISOString(),
      }))
      setWidgets(widgetList)
    } catch (err) {
      console.error('Error fetching widgets:', err)
      setWidgets([])
    }
  }

  const fetchLayouts = async () => {
    try {
      // Layouts are fetched per page, using a sample page
      const data = await apiClient.get<Record<string, unknown>>('/widget-engine/pages/homepage')
      setLayouts([
        {
          id: 'homepage',
          name: 'صفحه اصلی',
          description: 'Layout صفحه اصلی',
          grid: data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error('Error fetching layouts:', err)
      setLayouts([])
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<WidgetManifest[]>('/widget-engine/registry')
      const widgetList = data || []
      setStats({
        totalWidgets: widgetList.length,
        activeWidgets: widgetList.filter((w: WidgetManifest) => w.ssr !== false).length,
        totalLayouts: 1,
        categories: new Set(widgetList.map((w: WidgetManifest) => w.category || 'general')).size,
      })
    } catch (err) {
      console.error('Error fetching widget stats:', err)
      setStats({
        totalWidgets: 0,
        activeWidgets: 0,
        totalLayouts: 0,
        categories: 0,
      })
    }
  }

  const createWidget = async (_data: {
    key: string
    name: string | Record<string, string>
    category: string
    componentPath: string
    defaultSize: { cols: number; rows: number }
  }) => {
    try {
      // Widget creation is not directly supported through API - widgets are registered in code
      // However, we can provide a message to guide the developer
      throw new Error(
        'Widget creation not supported - widgets are registered in code (manifest.tsx)'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create widget')
      throw err
    }
  }

  const updateWidget = async (_id: string, _data: Partial<Widget>) => {
    try {
      // Widget updates are not directly supported through API
      throw new Error('Widget update not supported - widgets are registered in code (manifest.tsx)')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update widget')
      throw err
    }
  }

  const deleteWidget = async (_id: string) => {
    try {
      // Widget deletion is not directly supported through API
      throw new Error(
        'Widget deletion not supported - widgets are registered in code (manifest.tsx)'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete widget')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchWidgets(), fetchLayouts(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    widgets,
    layouts,
    stats,
    loading,
    error,
    fetchWidgets,
    fetchLayouts,
    fetchStats,
    createWidget,
    updateWidget,
    deleteWidget,
  }
}
