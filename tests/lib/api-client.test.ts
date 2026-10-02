import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiClient as ApiClientClass, ApiError } from '@/lib/api-client'

// Mock fetch
global.fetch = vi.fn()

describe('ApiClient', () => {
  let apiClient: ApiClientClass

  beforeEach(() => {
    apiClient = new ApiClientClass('http://test-api.com')
    vi.clearAllMocks()
  })

  describe('request method', () => {
    it('makes GET request successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await apiClient.get('/test')
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('makes POST request with body', async () => {
      const mockData = { success: true }
      const body = { name: 'Test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await apiClient.post('/test', body)
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    })

    it('handles API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      })

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError)
    })

    it('handles 204 No Content', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

      const result = await apiClient.delete('/test')
      expect(result).toBeUndefined()
    })

    it('includes authorization header when token is set', async () => {
      apiClient.setToken('test-token')
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await apiClient.get('/test')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('handles query parameters', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await apiClient.get('/test', {
        params: { page: 1, limit: 10, search: 'test' },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test?page=1&limit=10&search=test',
        expect.any(Object)
      )
    })
  })

  describe('HTTP methods', () => {
    beforeEach(() => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    })

    it('PUT method works', async () => {
      await apiClient.put('/test', { data: 'test' })
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('PATCH method works', async () => {
      await apiClient.patch('/test', { data: 'test' })
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('DELETE method works', async () => {
      await apiClient.delete('/test')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('token refresh', () => {
    it('attempts token refresh on 401', async () => {
      apiClient.setToken('expired-token')

      // First call fails with 401
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized' }),
        })
        // Refresh succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'new-token' }),
        })
        // Retry succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        })

      const result = await apiClient.get('/test')
      expect(result).toEqual({ data: 'success' })
      expect(apiClient['token']).toBe('new-token')
    })

    it('does not refresh on 401 for refresh endpoint', async () => {
      apiClient.setToken('expired-token')
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      })

      await expect(apiClient.get('/auth/refresh')).rejects.toThrow()
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})

describe('ApiError', () => {
  it('creates error with status and message', () => {
    const error = new ApiError(404, 'Not Found')
    expect(error.status).toBe(404)
    expect(error.message).toBe('Not Found')
    expect(error.name).toBe('ApiError')
  })

  it('creates error with validation errors', () => {
    const errors = { email: ['Invalid email'], password: ['Too short'] }
    const error = new ApiError(400, 'Validation Error', errors)
    expect(error.errors).toEqual(errors)
  })
})
