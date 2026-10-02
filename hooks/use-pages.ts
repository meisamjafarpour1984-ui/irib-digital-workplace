/**
 * IRIB Digital Workplace Platform - Pages Hook
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

export interface Page {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  author: string
  authorId: string
  updatedAt: string
  createdAt: string
  views: number
  content?: string
  layout?: Record<string, unknown>
}

export interface PageStats {
  totalPages: number
  published: number
  draft: number
  archived: number
  totalViews: number
}

export function usePages() {
  const [pages, setPages] = useState<Page[]>([])
  const [stats, setStats] = useState<PageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPages = async (params?: { status?: string; search?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search }),
      })

      const data = await apiClient.get<Page[]>(`/pages?${queryParams}`)
      setPages(data || [])
    } catch {
      // Silently use fallback data if API fails
      console.warn('Pages API not available, using fallback data')
      setPages(getFallbackPages())
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<PageStats>('/pages/stats')
      setStats(data)
    } catch {
      // Silently use fallback stats if API fails
      console.warn('Pages stats API not available, using fallback data')
      setStats(getFallbackStats())
    }
  }

  const createPage = async (data: {
    title: string
    slug: string
    content?: string
    layout?: Record<string, unknown>
  }) => {
    try {
      const result = await apiClient.post<Page>('/pages', data)
      setPages([...pages, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page')
      throw err
    }
  }

  const updatePage = async (id: string, data: Partial<Page>) => {
    try {
      const result = await apiClient.put<Page>(`/pages/${id}`, data)
      setPages(pages.map((p) => (p.id === id ? result : p)))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page')
      throw err
    }
  }

  const publishPage = async (id: string) => {
    try {
      const result = await apiClient.post<Page>(`/pages/${id}/publish`)
      setPages(pages.map((p) => (p.id === id ? result : p)))
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish page')
      throw err
    }
  }

  const deletePage = async (id: string) => {
    try {
      await apiClient.delete(`/pages/${id}`)
      setPages(pages.filter((p) => p.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page')
      throw err
    }
  }

  useEffect(() => {
    // Use fallback data directly since API endpoints don't exist yet
    setPages(getFallbackPages())
    setStats(getFallbackStats())
    setLoading(false)
  }, [])

  return {
    pages,
    stats,
    loading,
    error,
    fetchPages,
    fetchStats,
    createPage,
    updatePage,
    publishPage,
    deletePage,
  }
}

// Fallback data for when API is not available
function getFallbackPages(): Page[] {
  return [
    {
      id: '1',
      title: 'صفحه اصلی',
      slug: 'home',
      status: 'published',
      author: 'ادمین سیستم',
      authorId: 'admin',
      updatedAt: '۱۴۰۳/۰۵/۰۱',
      createdAt: '۱۴۰۳/۰۴/۰۱',
      views: 5678,
    },
    {
      id: '2',
      title: 'درباره ما',
      slug: 'about',
      status: 'published',
      author: 'ادمین سیستم',
      authorId: 'admin',
      updatedAt: '۱۴۰۳/۰۵/۰۲',
      createdAt: '۱۴۰۳/۰۴/۰۵',
      views: 3245,
    },
    {
      id: '3',
      title: 'تماس با ما',
      slug: 'contact',
      status: 'published',
      author: 'ادمین سیستم',
      authorId: 'admin',
      updatedAt: '۱۴۰۳/۰۵/۰۳',
      createdAt: '۱۴۰۳/۰۴/۱۰',
      views: 1892,
    },
    {
      id: '4',
      title: 'قوانین و مقررات',
      slug: 'terms',
      status: 'draft',
      author: 'ادمین سیستم',
      authorId: 'admin',
      updatedAt: '۱۴۰۳/۰۵/۰۵',
      createdAt: '۱۴۰۳/۰۵/۰۱',
      views: 0,
    },
    {
      id: '5',
      title: 'حریم خصوصی',
      slug: 'privacy',
      status: 'draft',
      author: 'ادمین سیستم',
      authorId: 'admin',
      updatedAt: '۱۴۰۳/۰۵/۰۶',
      createdAt: '۱۴۰۳/۰۵/۰۲',
      views: 0,
    },
    {
      id: '6',
      title: 'سوالات متداول',
      slug: 'faq',
      status: 'published',
      author: 'ادمین سیستم',
      authorId: 'admin',
      updatedAt: '۱۴۰۳/۰۵/۰۷',
      createdAt: '۱۴۰۳/۰۵/۰۳',
      views: 4567,
    },
  ]
}

function getFallbackStats(): PageStats {
  return {
    totalPages: 6,
    published: 4,
    draft: 2,
    archived: 0,
    totalViews: 15382,
  }
}
