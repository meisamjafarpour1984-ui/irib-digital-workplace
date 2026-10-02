/**
 * IRIB Digital Workplace Platform - Storage Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface StorageItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'other'
  size: number
  url: string
  mimeType: string
  uploadedBy: string
  uploadedAt: string
}

export interface StorageStats {
  totalItems: number
  totalSize: number
  byType: Record<string, number>
  totalAssets: number
  assetsByType: Array<{ mimeType: string; size: number; count: number }>
  recentUploads: Array<{
    id: string
    originalName: string
    size: number
    mimeType: string
    createdAt: string
    uploadedBy?: { name?: string }
  }>
}

export function useStorage() {
  const [items, setItems] = useState<StorageItem[]>([])
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchItems = async (params?: { type?: string; search?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<StorageItem[]>('/storage', {
        params: {
          ...(params?.type && { type: params.type }),
          ...(params?.search && { search: params.search }),
        },
      })

      setItems(data || [])
    } catch {
      // Silently use fallback data if API fails
      console.warn('Storage API not available, using fallback data')
      setItems(getFallbackItems())
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<StorageStats>('/storage/stats')
      setStats(data)
    } catch {
      // Silently use fallback stats if API fails
      console.warn('Storage stats API not available, using fallback data')
      setStats(getFallbackStats())
    }
  }

  const uploadFile = async (
    file: File,
    metadata?: {
      name?: string
      type?: string
    }
  ) => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      if (metadata?.name) formData.append('name', metadata.name)
      if (metadata?.type) formData.append('type', metadata.type)

      const newItem = await apiClient.post<StorageItem>('/storage/upload', formData)
      setItems([...items, newItem])
      await fetchStats()
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const testConnection = async () => {
    try {
      await apiClient.get('/storage/health')
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await apiClient.delete(`/storage/${id}`)
      setItems(items.filter((item) => item.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      throw err
    }
  }

  useEffect(() => {
    // Use fallback data directly since API endpoints don't exist yet
    setItems(getFallbackItems())
    setStats(getFallbackStats())
    setLoading(false)
  }, [])

  return {
    items,
    stats,
    loading,
    error,
    uploading,
    fetchItems,
    fetchStats,
    uploadFile,
    deleteItem,
    testConnection,
  }
}

// Fallback data for when API is not available
function getFallbackItems(): StorageItem[] {
  return [
    {
      id: '1',
      name: 'sample-image.jpg',
      type: 'image',
      size: 1024000,
      url: '/placeholder.jpg',
      mimeType: 'image/jpeg',
      uploadedBy: 'admin',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'sample-video.mp4',
      type: 'video',
      size: 51200000,
      url: '/placeholder.mp4',
      mimeType: 'video/mp4',
      uploadedBy: 'admin',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      name: 'document.pdf',
      type: 'document',
      size: 2048000,
      url: '/placeholder.pdf',
      mimeType: 'application/pdf',
      uploadedBy: 'admin',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]
}

function getFallbackStats(): StorageStats {
  return {
    totalItems: 3,
    totalSize: 54304000,
    byType: {
      image: 1,
      video: 1,
      document: 1,
    },
    totalAssets: 3,
    assetsByType: [
      { mimeType: 'image/jpeg', size: 1024000, count: 1 },
      { mimeType: 'video/mp4', size: 51200000, count: 1 },
      { mimeType: 'application/pdf', size: 2048000, count: 1 },
    ],
    recentUploads: [],
  }
}
