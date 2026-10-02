/**
 * Tests for dashboard data fetching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearDashboardDataCache, getDashboardData } from '@/lib/dashboard-data'

describe('Dashboard Data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearDashboardDataCache()
  })

  describe('getDashboardData', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockData = {
        dailyVisits: 150,
        activeUsers: 45,
        announcements: 5,
        polls: 3,
        recentActivity: [],
        recentTickets: [],
      }

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await getDashboardData()

      expect(result).toEqual(mockData)
    })

    it('should handle fetch errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

      await expect(getDashboardData()).rejects.toThrow('Network error')
    })

    it('should handle API errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(getDashboardData()).rejects.toThrow()
    })

    it('should cache results', async () => {
      const mockData = {
        dailyVisits: 150,
        activeUsers: 45,
        announcements: 5,
        polls: 3,
        recentActivity: [],
        recentTickets: [],
      }

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response)

      await getDashboardData()
      await getDashboardData()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
