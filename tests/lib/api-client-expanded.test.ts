/**
 * Expanded tests for APIClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { APIClient } from '@/lib/api-client'

describe('APIClient (Expanded)', () => {
  let apiClient: APIClient

  beforeEach(() => {
    apiClient = new APIClient('http://localhost:3001/api/v1')
    vi.clearAllMocks()
  })

  describe('request handling', () => {
    it('should handle successful requests', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
      }

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        status: 200,
      } as Response)

      const result = await apiClient.get('/test')

      expect(result).toEqual(mockResponse)
    })

    it('should handle authentication errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      } as Response)

      await expect(apiClient.get('/protected')).rejects.toThrow('Unauthorized')
    })

    it('should retry failed requests', async () => {
      let attempts = 0
      vi.spyOn(global, 'fetch').mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Network error')
        }
        return {
          ok: true,
          json: async () => ({ data: 'success' }),
          status: 200,
        } as Response
      })

      const result = await apiClient.get('/test')

      expect(attempts).toBe(3)
      expect(result).toEqual({ data: 'success' })
    })

    it('should timeout after configured duration', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      )

      await expect(apiClient.get('/test', { timeout: 1000 })).rejects.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Network error')
    })

    it('should handle server errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response)

      await expect(apiClient.get('/test')).rejects.toThrow('Internal server error')
    })

    it('should handle client errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      } as Response)

      await expect(apiClient.post('/test', {})).rejects.toThrow('Bad request')
    })
  })

  describe('request methods', () => {
    it('should handle GET requests', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'get' }),
        status: 200,
      } as Response)

      const result = await apiClient.get('/test')

      expect(result).toEqual({ data: 'get' })
    })

    it('should handle POST requests', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'post' }),
        status: 201,
      } as Response)

      const result = await apiClient.post('/test', { data: 'test' })

      expect(result).toEqual({ data: 'post' })
    })

    it('should handle PUT requests', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'put' }),
        status: 200,
      } as Response)

      const result = await apiClient.put('/test', { data: 'updated' })

      expect(result).toEqual({ data: 'put' })
    })

    it('should handle DELETE requests', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'deleted' }),
        status: 200,
      } as Response)

      const result = await apiClient.delete('/test')

      expect(result).toEqual({ data: 'deleted' })
    })
  })
})
