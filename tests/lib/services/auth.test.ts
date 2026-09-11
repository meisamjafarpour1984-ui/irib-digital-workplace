/**
 * Tests for Auth API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authApi } from '@/lib/services/auth'

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register with valid credentials', async () => {
      const mockResponse = {
        challengeId: 'challenge-123',
        expiresIn: 300,
        devOtp: '123456',
      }

      vi.spyOn(authApi, 'register').mockResolvedValue(mockResponse)

      const result = await authApi.register({
        personnelCode: '123456',
        mobile: '09123456789',
        name: 'Test User',
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle registration failures', async () => {
      vi.spyOn(authApi, 'register').mockRejectedValue(new Error('Registration failed'))

      await expect(
        authApi.register({
          personnelCode: '123456',
          mobile: '09123456789',
        })
      ).rejects.toThrow('Registration failed')
    })
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockResponse = {
        challengeId: 'challenge-123',
        expiresIn: 300,
        devOtp: '123456',
      }

      vi.spyOn(authApi, 'login').mockResolvedValue(mockResponse)

      const result = await authApi.login({
        personnelCode: '123456',
        password: 'password123',
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle login failures', async () => {
      vi.spyOn(authApi, 'login').mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        authApi.login({
          personnelCode: '123456',
          password: 'wrong-password',
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: {
          id: '1',
          name: 'Test User',
          personnelCode: '123456',
        },
      }

      vi.spyOn(authApi, 'verifyOtp').mockResolvedValue(mockResponse)

      const result = await authApi.verifyOtp({
        challengeId: 'challenge-123',
        code: '123456',
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle invalid OTP', async () => {
      vi.spyOn(authApi, 'verifyOtp').mockRejectedValue(new Error('Invalid OTP'))

      await expect(
        authApi.verifyOtp({
          challengeId: 'challenge-123',
          code: '000000',
        })
      ).rejects.toThrow('Invalid OTP')
    })
  })

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        user: {
          id: '1',
          name: 'Test User',
          personnelCode: '123456',
        },
      }

      vi.spyOn(authApi, 'refresh').mockResolvedValue(mockResponse)

      const result = await authApi.refresh()

      expect(result).toEqual(mockResponse)
    })

    it('should handle token refresh failures', async () => {
      vi.spyOn(authApi, 'refresh').mockRejectedValue(new Error('Invalid refresh token'))

      await expect(authApi.refresh()).rejects.toThrow('Invalid refresh token')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = { success: true }

      vi.spyOn(authApi, 'logout').mockResolvedValue(mockResponse)

      const result = await authApi.logout()

      expect(result).toEqual(mockResponse)
    })

    it('should handle logout failures', async () => {
      vi.spyOn(authApi, 'logout').mockRejectedValue(new Error('Logout failed'))

      await expect(authApi.logout()).rejects.toThrow('Logout failed')
    })
  })

  describe('keycloakLogin', () => {
    it('should login via Keycloak successfully', async () => {
      const mockResponse = {
        accessToken: 'keycloak-access-token',
        refreshToken: 'keycloak-refresh-token',
        expiresIn: 3600,
        user: {
          id: '1',
          name: 'Test User',
          personnelCode: '123456',
        },
      }

      vi.spyOn(authApi, 'keycloakLogin').mockResolvedValue(mockResponse)

      const result = await authApi.keycloakLogin({
        personnelCode: '123456',
        password: 'password123',
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle Keycloak login failures', async () => {
      vi.spyOn(authApi, 'keycloakLogin').mockRejectedValue(
        new Error('Keycloak authentication failed')
      )

      await expect(
        authApi.keycloakLogin({
          personnelCode: '123456',
          password: 'wrong-password',
        })
      ).rejects.toThrow('Keycloak authentication failed')
    })
  })
})
