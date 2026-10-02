import { Test, TestingModule } from '@nestjs/testing'
import { MobileIdentityService } from './mobile-identity.service'
import { PrismaService } from '../../prisma/prisma.service'
import jwt from 'jsonwebtoken'

describe('MobileIdentityService', () => {
  let service: MobileIdentityService
  let prisma: PrismaService

  beforeAll(() => {
    process.env.JWT_SECRET = 'dev-secret'
  })

  const mockPrisma = {
    user: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: 'u1', personnelCode: '123', mobile: '09123456789' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'u1', name: 'Ali' }),
    },
    deviceRegistration: {
      create: jest
        .fn()
        .mockResolvedValue({
          id: 'dev-1',
          userId: 'u1',
          deviceId: 'device-123',
          platform: 'WEB_PWA',
        }),
    },
    pushSubscription: {
      create: jest.fn().mockResolvedValue({ id: 'sub-1' }),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [MobileIdentityService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<MobileIdentityService>(MobileIdentityService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('register', () => {
    it('returns a challenge when credentials match', async () => {
      const r = await service.register({ personnelCode: '123', mobile: '09123456789' })
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { personnelCode: '123', mobile: '09123456789' },
      })
      expect(r).toEqual(expect.objectContaining({ challengeId: 'u1', message: 'OTP sent' }))
    })
  })

  describe('verifyOtp', () => {
    it('returns access and refresh tokens for a valid OTP', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', name: 'Ali' })
      const r = await service.verifyOtp({ challengeId: 'u1', code: '123456' })
      expect(r).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        })
      )
    })
  })

  describe('linkDevice', () => {
    it('links a device after JWT validation', async () => {
      const token = jwt.sign({ sub: 'u1' }, 'dev-secret', { expiresIn: '15m' })
      const r = await service.linkDevice({ token, deviceId: 'device-123', publicKey: 'pubkey' })
      expect(prisma.deviceRegistration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'u1', deviceId: 'device-123' }),
        })
      )
      expect(r).toEqual({ success: true, message: 'Device linked' })
    })
  })

  describe('registerPushSubscription', () => {
    it('stores a push subscription for the user', async () => {
      await service.registerPushSubscription('u1', {
        endpoint: 'https://example.com',
        p256dh: 'a',
        auth: 'b',
      })
      expect(prisma.pushSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: 'u1' }) })
      )
    })
  })
})
