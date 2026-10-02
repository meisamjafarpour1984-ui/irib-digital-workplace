import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { MobileVerificationService } from './mobile-verification.service'
import type { SendOtpDto, VerifyOtpDto, UpdateMobileDto } from './dto/mobile-verification.dto'

@Controller('mobile-verification')
export class MobileVerificationController {
  constructor(private readonly service: MobileVerificationService) {}

  /**
   * Send OTP to mobile number
   * POST /mobile-verification/send-otp
   */
  @Post('send-otp')
  @UseGuards(JwtAuthGuard)
  async sendOtp(@Body() dto: SendOtpDto, @Request() req: any) {
    return this.service.sendOtp(req.user.id, dto.mobile, dto.purpose)
  }

  /**
   * Verify OTP code
   * POST /mobile-verification/verify-otp
   */
  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.service.verifyOtp(dto.challengeId, dto.code)
  }

  /**
   * Update mobile number (requires re-verification)
   * POST /mobile-verification/update-mobile
   */
  @Post('update-mobile')
  @UseGuards(JwtAuthGuard)
  async updateMobile(@Body() dto: UpdateMobileDto, @Request() req: any) {
    return this.service.updateMobile(req.user.id, dto.mobile)
  }

  /**
   * Check if mobile is verified
   * GET /mobile-verification/status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req: any) {
    const verified = await this.service.isMobileVerified(req.user.id)
    return { phoneVerified: verified }
  }

  /**
   * Get current SMS provider info
   * GET /mobile-verification/provider
   */
  @Get('provider')
  @UseGuards(JwtAuthGuard)
  getProvider() {
    return {
      provider: this.service.getProviderName(),
    }
  }
}
