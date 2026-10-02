/**
 * IRIB Digital Workplace Platform - Announcements Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Announcement {
  id: string
  title: string
  content: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  publishedAt?: string
  scheduledAt?: string
  author: string
  authorId: string
  views: number
  targetAudience?: string[]
  createdAt: string
  updatedAt: string
}

export interface AnnouncementStats {
  totalAnnouncements: number
  published: number
  draft: number
  scheduled: number
  totalViews: number
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<AnnouncementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnnouncements = async (params?: {
    status?: string
    priority?: string
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        ...(params?.status && { status: params.status }),
        ...(params?.priority && { priority: params.priority }),
        ...(params?.search && { search: params.search }),
      })

      const data = await apiClient.get<Announcement[]>(`/announcements?${queryParams}`)
      setAnnouncements(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements')
      console.error('Error fetching announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<AnnouncementStats>('/announcements/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching announcement stats:', err)
    }
  }

  const createAnnouncement = async (data: {
    title: string
    content: string
    priority: string
    targetAudience?: string[]
    scheduledAt?: string
  }) => {
    try {
      const result = await apiClient.post<Announcement>('/announcements', data)
      setAnnouncements([...announcements, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement')
      throw err
    }
  }

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      const result = await apiClient.put<Announcement>(`/announcements/${id}`, data)
      setAnnouncements(announcements.map((a) => (a.id === id ? result : a)))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update announcement')
      throw err
    }
  }

  const publishAnnouncement = async (id: string) => {
    try {
      const result = await apiClient.post<Announcement>(`/announcements/${id}/publish`)
      setAnnouncements(announcements.map((a) => (a.id === id ? result : a)))
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish announcement')
      throw err
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      await apiClient.delete(`/announcements/${id}`)
      setAnnouncements(announcements.filter((a) => a.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchAnnouncements(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    announcements,
    stats,
    loading,
    error,
    fetchAnnouncements,
    fetchStats,
    createAnnouncement,
    updateAnnouncement,
    publishAnnouncement,
    deleteAnnouncement,
  }
}
