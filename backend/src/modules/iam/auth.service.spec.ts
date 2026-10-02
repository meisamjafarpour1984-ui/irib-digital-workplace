jest.mock('@keycloak/keycloak-admin-client', () => ({
  __esModule: true,
  default: class MockKeycloakAdminClient {},
}))

import * as bcrypt from 'bcrypt'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { PrismaService } from '../../prisma/prisma.service'
import { MobileVerificationService } from '../mobile-verification/mobile-verification.service'
import { KeycloakService } from './keycloak.service'

describe('AuthService', () => {
  let service: AuthService

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    otpChallenge: {
      findUnique: jest.fn(),
    },
    authSession: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  }

  const mockConfigService = {
    get: jest.fn((key: string, fallback?: any) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret-key-min-32-chars-long',
        JWT_ISSUER: 'irib-dwp-test',
        JWT_AUDIENCE: 'irib-dwp-web-test',
        NODE_ENV: 'test',
        AUTH_TYPE: 'local',
      }
      return config[key] ?? fallback
    }),
  }

  const mockMobileVerificationService = {
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
  }

  const mockKeycloakService = {
    getUserInfo: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService as any },
        { provide: ConfigService, useValue: mockConfigService as any },
        { provide: MobileVerificationService, useValue: mockMobileVerificationService as any },
        { provide: KeycloakService, useValue: mockKeycloakService as any },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  describe('register', () => {
    it('creates a user and returns an OTP challenge', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-123',
        personnelCode: '123456',
        mobile: '09123456789',
        status: 'PENDING',
      })
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-123', mobile: '09123456789' })
      mockMobileVerificationService.sendOtp.mockResolvedValue({
        challengeId: 'otp-1',
        expiresIn: 120,
      })

      const result = await service.register({
        personnelCode: '123456',
        mobile: '09123456789',
        name: 'Test User',
      })

      expect(mockPrismaService.user.create).toHaveBeenCalled()
      expect(mockMobileVerificationService.sendOtp).toHaveBeenCalledWith(
        'user-123',
        '09123456789',
        'registration'
      )
      expect(result).toEqual({ challengeId: 'otp-1', expiresIn: 120 })
    })
  })

  describe('login', () => {
    it('creates an OTP challenge for valid local credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        personnelCode: '123456',
        passwordHash,
        status: 'ACTIVE',
        mobile: '09123456789',
      })
      mockMobileVerificationService.sendOtp.mockResolvedValue({
        challengeId: 'otp-1',
        expiresIn: 120,
      })

      const result = await service.login({ personnelCode: '123456', password: 'password123' })
      expect(mockMobileVerificationService.sendOtp).toHaveBeenCalledWith(
        'user-123',
        '09123456789',
        'login'
      )
      expect(result).toEqual({ challengeId: 'otp-1', expiresIn: 120 })
    })

    it('throws for invalid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        personnelCode: '123456',
        passwordHash: '$2b$10$hashedpassword',
        status: 'ACTIVE',
        mobile: '09123456789',
      })

      await expect(service.login({ personnelCode: '123456', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException
      )
    })
  })

  describe('verifyOtp', () => {
    it('verifies a challenge and creates a session', async () => {
      mockMobileVerificationService.verifyOtp.mockResolvedValue({ success: true })
      mockPrismaService.otpChallenge.findUnique.mockResolvedValue({
        id: 'otp-1',
        userId: 'user-123',
      })
      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123', status: 'ACTIVE' })
      mockPrismaService.authSession.create.mockResolvedValue({ id: 'session-1' })
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        personnelCode: '123456',
        name: 'Test',
        nameFa: 'تست',
        email: 'test@example.com',
        mobile: '09123456789',
        roles: [],
        departments: [],
      })

      const result = await service.verifyOtp({ challengeId: 'otp-1', code: '123456' })

      expect(mockMobileVerificationService.verifyOtp).toHaveBeenCalledWith('otp-1', '123456')
      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(mockPrismaService.authSession.create).toHaveBeenCalled()
    })
  })

  describe('refresh', () => {
    it('returns a new access token for a valid session', async () => {
      mockPrismaService.authSession.findFirst.mockResolvedValue({
        id: 'session-1',
        userId: 'user-123',
        refreshTokenHash: 'hash',
        expiresAt: new Date(Date.now() + 1000),
        revokedAt: null,
      })
      mockPrismaService.authSession.update.mockResolvedValue({ id: 'session-1' })
      mockPrismaService.authSession.create.mockResolvedValue({ id: 'session-2' })
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        personnelCode: '123456',
        name: 'Test',
        nameFa: 'تست',
        email: 'test@example.com',
        mobile: '09123456789',
        roles: [],
        departments: [],
      })

      const result = await service.refresh('valid-refresh-token')
      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
    })
  })

  describe('logout', () => {
    it('revokes sessions when a refresh token is provided', async () => {
      mockPrismaService.authSession.updateMany.mockResolvedValue({ count: 1 })
      await service.logout('refresh-token')
      expect(mockPrismaService.authSession.updateMany).toHaveBeenCalled()
    })
  })

  describe('setPin', () => {
    it('hashes and stores the new PIN', async () => {
      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123' })
      await service.setPin('user-123', '1234')
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { passwordHash: expect.any(String) },
      })
    })
  })
})
