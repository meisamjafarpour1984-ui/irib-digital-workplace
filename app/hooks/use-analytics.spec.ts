/**
 * IRIB Digital Workplace Platform - Analytics Hook Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnalytics } from '@/app/hooks/use-analytics'

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchKPIs', () => {
    it('should fetch KPIs successfully', async () => {
      const mockKPIs = {
        totalUsers: 1000,
        activeUsers: 800,
        totalContent: 500,
        totalTickets: 50,
      }

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockKPIs)

      const { result } = useAnalytics()
      await result.fetchKPIs()

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/analytics/kpi')
      expect(result.kpis).toEqual(mockKPIs)
    })

    it('should handle fetch KPIs error', async () => {
      const errorMessage = 'Failed to fetch KPIs'
      ;(require('@/lib/api-client').apiClient.get as any).mockRejectedValue(new Error(errorMessage))

      const { result } = useAnalytics()
      await result.fetchKPIs()

      expect(result.error).toBe(errorMessage)
    })
  })

  describe('fetchVisits', () => {
    it('should fetch visits data successfully', async () => {
      const mockVisits = {
        data: [
          { date: '2024-01-01', visits: 100 },
          { date: '2024-01-02', visits: 150 },
        ],
        total: 250,
      }

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockVisits)

      const { result } = useAnalytics()
      await result.fetchVisits('2024-01-01', '2024-01-31')

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/analytics/visits', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      })
      expect(result.visits).toEqual(mockVisits)
    })

    it('should handle fetch visits error', async () => {
      const errorMessage = 'Failed to fetch visits'
      ;(require('@/lib/api-client').apiClient.get as any).mockRejectedValue(new Error(errorMessage))

      const { result } = useAnalytics()
      await result.fetchVisits('2024-01-01', '2024-01-31')

      expect(result.error).toBe(errorMessage)
    })
  })

  describe('fetchTrafficBySource', () => {
    it('should fetch traffic by source successfully', async () => {
      const mockTraffic = [
        { source: 'Direct', count: 300 },
        { source: 'Organic', count: 200 },
        { source: 'Referral', count: 100 },
      ]

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockTraffic)

      const { result } = useAnalytics()
      await result.fetchTrafficBySource()

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith('/analytics/traffic')
      expect(result.traffic).toEqual(mockTraffic)
    })

    it('should handle fetch traffic error', async () => {
      const errorMessage = 'Failed to fetch traffic'
      ;(require('@/lib/api-client').apiClient.get as any).mockRejectedValue(new Error(errorMessage))

      const { result } = useAnalytics()
      await result.fetchTrafficBySource()

      expect(result.error).toBe(errorMessage)
    })
  })

  describe('fetchActivity', () => {
    it('should fetch activity data successfully', async () => {
      const mockActivity = [
        { id: '1', action: 'LOGIN', timestamp: '2024-01-01T10:00:00Z', user: 'user1' },
        { id: '2', action: 'CONTENT_CREATE', timestamp: '2024-01-01T11:00:00Z', user: 'user2' },
      ]

      ;(require('@/lib/api-client').apiClient.get as any).mockResolvedValue(mockActivity)

      const { result } = useAnalytics()
      await result.fetchActivity(10)

      expect(require('@/lib/api-client').apiClient.get).toHaveBeenCalledWith(
        '/analytics/activity',
        {
          params: {
            limit: 10,
          },
        }
      )
      expect(result.activity).toEqual(mockActivity)
    })

    it('should handle fetch activity error', async () => {
      const errorMessage = 'Failed to fetch activity'
      ;(require('@/lib/api-client').apiClient.get as any).mockRejectedValue(new Error(errorMessage))

      const { result } = useAnalytics()
      await result.fetchActivity(10)

      expect(result.error).toBe(errorMessage)
    })
  })
})
