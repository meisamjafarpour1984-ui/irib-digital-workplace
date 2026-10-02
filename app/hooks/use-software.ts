/**
 * IRIB Digital Workplace Platform - Software Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Software {
  id: string
  name: string
  version: string
  size: string
  category: string
  downloads: number
  status: string
  uploadedAt: string
  uploadedBy?: {
    id: string
    name: string
  }
}

export interface SoftwareStats {
  totalSoftware: number
  totalDownloads: number
  totalSize: number
  categories: number
  byCategory: Array<{ category: string; count: number }>
}

export function useSoftware() {
  const [software, setSoftware] = useState<Software[]>([])
  const [stats, setStats] = useState<SoftwareStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchSoftware = async (params?: {
    category?: string
    search?: string
    status?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<Software[]>('/software', {
        params: {
          ...(params?.category && { category: params.category }),
          ...(params?.search && { search: params.search }),
          ...(params?.status && { status: params.status }),
        },
      })

      setSoftware(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching software:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Stats endpoint doesn't exist, calculate from software list
      const softwareList = await apiClient.get<Software[]>('/software')
      setStats({
        totalSoftware: softwareList.length,
        totalDownloads: softwareList.reduce((sum, s) => sum + (s.downloads || 0), 0),
        totalSize: softwareList.reduce((sum, s) => sum + (s.size ? parseFloat(s.size) : 0), 0),
        categories: new Set(softwareList.map((s) => s.category)).size,
        byCategory: [],
      })
    } catch (err) {
      console.error('Error fetching software stats:', err)
    }
  }

  const uploadSoftware = async (
    _file: File,
    _metadata: {
      name: string
      version: string
      category: string
    }
  ) => {
    try {
      setUploading(true)
      setError(null)

      // Upload endpoint doesn't exist in backend - return error
      throw new Error('Software upload not implemented in backend yet')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload software')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const deleteSoftware = async (id: string) => {
    try {
      await apiClient.delete(`/software/${id}`)
      setSoftware(software.filter((s) => s.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete software')
      throw err
    }
  }

  const updateSoftware = async (id: string, data: Partial<Software>) => {
    try {
      const updatedSoftware = await apiClient.put<Software>(`/software/${id}`, data)
      setSoftware(software.map((s) => (s.id === id ? updatedSoftware : s)))
      return updatedSoftware
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update software')
      throw err
    }
  }

  useEffect(() => {
    void fetchSoftware()
    void fetchStats()
  }, [])

  return {
    software,
    stats,
    loading,
    error,
    uploading,
    fetchSoftware,
    fetchStats,
    uploadSoftware,
    deleteSoftware,
    updateSoftware,
  }
}
