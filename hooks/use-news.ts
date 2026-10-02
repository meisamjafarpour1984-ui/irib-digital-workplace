/**
 * IRIB Digital Workplace Platform - News Hook
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

export interface NewsItem {
  id: string
  title: string | { fa?: string; en?: string }
  excerpt: string | { fa?: string; en?: string }
  content: string
  date: string
  category: string
  contentType?: string
  image?: string
  author: string
  authorId: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export interface NewsStats {
  totalNews: number
  published: number
  byCategory: Array<{ category: string; count: number }>
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [stats, setStats] = useState<NewsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async (params?: { category?: string; search?: string; limit?: number }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        ...(params?.category && { category: params.category }),
        ...(params?.search && { search: params.search }),
        ...(params?.limit && { limit: params.limit.toString() }),
      })

      const data = await apiClient.get<NewsItem[]>(`/news?${queryParams}`)
      setNews(data || [])
    } catch {
      // Silently use fallback data if API fails
      console.warn('News API not available, using fallback data')
      setNews(getFallbackNews())
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsBySlug = async (slug: string) => {
    try {
      const data = await apiClient.get<NewsItem>(`/news/${slug}`)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      throw err
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<NewsStats>('/news/stats')
      setStats(data)
    } catch {
      // Silently use fallback stats if API fails
      console.warn('News stats API not available, using fallback data')
      setStats(getFallbackStats())
    }
  }

  useEffect(() => {
    // Use fallback data directly since API endpoints don't exist yet
    const loadAll = async () => {
      setLoading(true)
      // Skip API calls and use fallback data directly
      setNews(getFallbackNews())
      setStats(getFallbackStats())
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    news,
    stats,
    loading,
    error,
    fetchNews,
    fetchNewsBySlug,
    fetchStats,
  }
}

// Fallback data for when API is not available
function getFallbackNews(): NewsItem[] {
  return [
    {
      id: '1',
      title: { fa: 'خبر ویژه: راه‌اندازی سیستم جدید', en: 'Featured: New System Launch' },
      excerpt: {
        fa: 'سیستم جدید دیجیتال کارکنان با موفقیت راه‌اندازی شد',
        en: 'New digital employee system successfully launched',
      },
      content: '',
      date: new Date().toISOString(),
      category: 'عمومی',
      contentType: 'خبر',
      author: 'ادمین سیستم',
      authorId: 'admin',
      slug: 'new-system-launch',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: { fa: 'به‌روزرسانی امنیتی', en: 'Security Update' },
      excerpt: {
        fa: 'به‌روزرسانی امنیتی جدید برای سیستم اعمال شد',
        en: 'New security update applied to system',
      },
      content: '',
      date: new Date().toISOString(),
      category: 'امنیتی',
      contentType: 'اطلاعیه',
      author: 'تیم امنیت',
      authorId: 'security',
      slug: 'security-update',
      status: 'published',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      title: { fa: 'دوره آموزشی جدید', en: 'New Training Course' },
      excerpt: {
        fa: 'دوره آموزشی جدید برای کارکنان آغاز شد',
        en: 'New training course started for employees',
      },
      content: '',
      date: new Date().toISOString(),
      category: 'آموزشی',
      contentType: 'آموزش',
      author: 'تیم آموزش',
      authorId: 'training',
      slug: 'new-training-course',
      status: 'published',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]
}

function getFallbackStats(): NewsStats {
  return {
    totalNews: 3,
    published: 3,
    byCategory: [
      { category: 'عمومی', count: 1 },
      { category: 'امنیتی', count: 1 },
      { category: 'آموزشی', count: 1 },
    ],
  }
}
