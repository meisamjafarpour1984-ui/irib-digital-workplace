import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomInt } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import { SmsService } from '../sms/sms.service'
// import { SmsTemplateService } from '../sms/sms-template.service'
import { MobileVerificationRepository } from './mobile-verification.repository'

const OTP_TTL_MS = 2 * 60 * 1000
const OTP_RATE_WINDOW_MS = 10 * 60 * 1000
const OTP_RATE_LIMIT = 5

@Injectable()
export class MobileVerificationService {
  private readonly logger = new Logger(MobileVerificationService.name)
  private readonly isProduction: boolean

  constructor(
    private config: ConfigService,
    private repository: MobileVerificationRepository,
    private smsService: SmsService
    // private smsTemplateService: SmsTemplateService,
  ) {
    this.isProduction = config.get<string>('NODE_ENV') === 'production'
  }

  /**
   * Send OTP to a mobile number for verification
   */
  async sendOtp(userId: string, mobile: string, purpose: string) {
    // Rate limiting check
    const recentChallenges = await this.repository.countRecentChallenges(
      userId,
      purpose,
      new Date(Date.now() - OTP_RATE_WINDOW_MS)
    )

    if (recentChallenges >= OTP_RATE_LIMIT) {
      throw new HttpException('OTP request limit exceeded', HttpStatus.TOO_MANY_REQUESTS)
    }

    // Invalidate previous challenges
    await this.repository.invalidatePreviousChallenges(userId, purpose)

    // Generate OTP
    const code = this.isProduction ? randomInt(100000, 1000000).toString() : '123456'
    const codeHash = await bcrypt.hash(code, 10)

    // Create challenge
    const challenge = await this.repository.createOtpChallenge({
      userId,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    })

    // Send SMS via SmsService using template (non-blocking)
    try {
      const message = `کد تایید شما: ${code}`

      const result = await this.smsService.send(mobile, message)

      if (!result.success) {
        this.logger.warn(
          `Failed to send SMS to ${mobile}: ${result.error} - OTP verification will still work with code: ${code}`
        )
      }
    } catch (error) {
      this.logger.warn(`Error sending SMS to ${mobile}:`, error)
      // OTP verification will still work even if SMS fails
    }

    return {
      challengeId: challenge.id,
      expiresIn: OTP_TTL_MS / 1000,
      ...(!this.isProduction && { devOtp: code }),
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(challengeId: string, code: string) {
    const challenge = await this.repository.findOtpChallenge(challengeId)

    if (!challenge) {
      throw new HttpException('Invalid challenge', HttpStatus.BAD_REQUEST)
    }

    if (challenge.consumedAt || challenge.expiresAt <= new Date()) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST)
    }

    const maxAttempts = 5
    if (challenge.attempts >= maxAttempts) {
      throw new HttpException('OTP attempt limit exceeded', HttpStatus.TOO_MANY_REQUESTS)
    }

    const valid = await bcrypt.compare(code, challenge.codeHash)

    if (!valid) {
      await this.repository.updateOtpChallenge(challengeId, {
        attempts: { increment: 1 },
      })
      throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED)
    }

    await this.repository.updateOtpChallenge(challengeId, {
      consumedAt: new Date(),
    })

    await this.repository.updateUserPhoneVerification(challenge.userId, true)

    return {
      success: true,
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    }
  }

  /**
   * Update user's mobile number (requires re-verification)
   */
  async updateMobile(userId: string, newMobile: string) {
    await this.repository.updateUserMobile(userId, newMobile)
    return { success: true, phoneVerified: false }
  }

  /**
   * Check if user's mobile is verified
   */
  async isMobileVerified(_userId: string) {
    // phoneVerified field doesn't exist in current schema
    // Return false for now
    return false
  }

  /**
   * Get current provider name
   */
  async getProviderName() {
    const status = await this.smsService.getProviderStatus()
    return status.provider || 'Unknown'
  }
}
