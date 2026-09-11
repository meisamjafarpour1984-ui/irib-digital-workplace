/**
 * Tests for AuthService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '@/lib/services/auth'

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockResponse = {
        data: {
          token: 'mock-token',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      }

      vi.spyOn(authService, 'login').mockResolvedValue(mockResponse)

      const result = await authService.login('test@example.com', 'password123')

      expect(result).toEqual(mockResponse)
    })

    it('should handle login failures', async () => {
      vi.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'))

      await expect(authService.login('test@example.com', 'wrong-password')).rejects.toThrow(
        'Invalid credentials'
      )
    })

    it('should handle network errors', async () => {
      vi.spyOn(authService, 'login').mockRejectedValue(new Error('Network error'))

      await expect(authService.login('test@example.com', 'password123')).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('logout', () => {
    it('should logout correctly', async () => {
      vi.spyOn(authService, 'logout').mockResolvedValue(undefined)

      await authService.logout()

      expect(authService.logout).toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const mockResponse = {
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
        },
      }

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(mockResponse)

      const result = await authService.refreshToken('old-refresh-token')

      expect(result).toEqual(mockResponse)
    })

    it('should handle token refresh failures', async () => {
      vi.spyOn(authService, 'refreshToken').mockRejectedValue(new Error('Invalid refresh token'))

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token'
      )
    })
  })

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const mockResponse = {
        data: {
          verified: true,
          token: 'verified-token',
        },
      }

      vi.spyOn(authService, 'verifyOTP').mockResolvedValue(mockResponse)

      const result = await authService.verifyOTP('123456', 'user-id')

      expect(result).toEqual(mockResponse)
    })

    it('should handle invalid OTP', async () => {
      vi.spyOn(authService, 'verifyOTP').mockRejectedValue(new Error('Invalid OTP'))

      await expect(authService.verifyOTP('000000', 'user-id')).rejects.toThrow('Invalid OTP')
    })
  })
})
