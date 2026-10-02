import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { MobileVerificationService } from './mobile-verification.service'
import { MobileVerificationRepository } from './mobile-verification.repository'
import { SmsService } from '../sms/sms.service'

describe('MobileVerificationService', () => {
  let service: MobileVerificationService

  const mockRepository = {
    countRecentChallenges: jest.fn().mockResolvedValue(0),
    invalidatePreviousChallenges: jest.fn().mockResolvedValue({}),
    createOtpChallenge: jest.fn().mockResolvedValue({ id: 'otp-1' }),
    findOtpChallenge: jest.fn(),
    updateOtpChallenge: jest.fn().mockResolvedValue({}),
    updateUserPhoneVerification: jest.fn().mockResolvedValue({}),
    findUserById: jest.fn().mockResolvedValue({ id: 'u1', mobile: '09123456789' }),
    updateUserMobile: jest.fn().mockResolvedValue({}),
  }

  const mockSms = {
    send: jest.fn().mockResolvedValue({ success: true }),
    getProviderStatus: jest.fn().mockResolvedValue({ provider: 'test-provider' }),
  }

  const mockConfig = {
    get: jest.fn(
      (key: string, fallback?: any) =>
        ({
          NODE_ENV: 'test',
        })[key] ?? fallback
    ),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [
        MobileVerificationService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: MobileVerificationRepository, useValue: mockRepository },
        { provide: SmsService, useValue: mockSms },
      ],
    }).compile()
    service = m.get<MobileVerificationService>(MobileVerificationService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('sendOtp', () => {
    it('creates an OTP challenge and sends an SMS', async () => {
      const challenge = await service.sendOtp('u1', '09123456789', 'REGISTRATION')
      expect(mockRepository.countRecentChallenges).toHaveBeenCalled()
      expect(mockRepository.createOtpChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          purpose: 'REGISTRATION',
          expiresAt: expect.any(Date),
        })
      )
      expect(mockSms.send).toHaveBeenCalledWith('09123456789', expect.stringContaining('کد تایید'))
      expect(challenge).toEqual(
        expect.objectContaining({ challengeId: 'otp-1', expiresIn: expect.any(Number) })
      )
    })
  })

  describe('verifyOtp', () => {
    it('returns success when the code matches', async () => {
      const hash = await bcrypt.hash('123456', 10)
      mockRepository.findOtpChallenge.mockResolvedValueOnce({
        id: 'otp-1',
        userId: 'u1',
        attempts: 0,
        expiresAt: new Date(Date.now() + 120000),
        consumedAt: null,
        codeHash: hash,
      })

      const result = await service.verifyOtp('otp-1', '123456')
      expect(result).toEqual(expect.objectContaining({ success: true, phoneVerified: true }))
      expect(mockRepository.updateOtpChallenge).toHaveBeenCalledWith(
        'otp-1',
        expect.objectContaining({ consumedAt: expect.any(Date) })
      )
    })

    it('throws for an invalid OTP', async () => {
      const hash = await bcrypt.hash('654321', 10)
      mockRepository.findOtpChallenge.mockResolvedValueOnce({
        id: 'otp-1',
        userId: 'u1',
        attempts: 0,
        expiresAt: new Date(Date.now() + 120000),
        consumedAt: null,
        codeHash: hash,
      })

      await expect(service.verifyOtp('otp-1', '123456')).rejects.toThrow('Invalid OTP')
    })
  })
})
