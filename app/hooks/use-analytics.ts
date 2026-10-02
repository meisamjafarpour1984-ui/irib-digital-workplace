/**
 * IRIB Digital Workplace Platform - Analytics Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface AnalyticsData {
  totalVisits: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{ page: string; visits: number }>
  trafficByDevice: Array<{ device: string; percentage: number }>
  trafficBySource: Array<{ source: string; percentage: number }>
  overview?: AnalyticsOverview
}

export interface AnalyticsOverview {
  users: { total: number; active: number }
  content: { total: number; published: number }
  forms: { total: number; submissions: number }
  activity: { auditLogs: number }
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async (params?: { startDate?: string; endDate?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const analyticsData = await apiClient.get<AnalyticsData>('/analytics', {
        params: {
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
      })

      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAnalytics()
  }, [])

  return {
    data,
    overview: data?.overview,
    loading,
    error,
    fetchAnalytics,
  }
}
