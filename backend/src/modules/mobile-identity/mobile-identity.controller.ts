import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MobileIdentityService } from './mobile-identity.service'

@ApiTags('Mobile Identity')
@Controller('auth/mobile')
export class MobileIdentityController {
  constructor(private readonly mobileIdentityService: MobileIdentityService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register mobile device' })
  async register(@Body() body: { personnelCode: string; mobile: string }) {
    return this.mobileIdentityService.register(body)
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for mobile' })
  async verifyOtp(@Body() body: { challengeId: string; code: string }) {
    return this.mobileIdentityService.verifyOtp(body)
  }

  @Post('link-device')
  @ApiOperation({ summary: 'Link desktop device via QR' })
  async linkDevice(@Body() body: { token: string; deviceId: string; publicKey: string }) {
    return this.mobileIdentityService.linkDevice(body)
  }

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Register push subscription' })
  async subscribePush(
    @Body()
    body: {
      userId: string
      subscription: { endpoint: string; p256dh: string; auth: string }
    }
  ) {
    return this.mobileIdentityService.registerPushSubscription(body.userId, body.subscription)
  }
}
