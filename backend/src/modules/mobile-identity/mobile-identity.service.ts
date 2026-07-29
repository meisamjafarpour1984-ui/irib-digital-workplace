import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class MobileIdentityService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret'

  constructor(private readonly prisma: PrismaService) {}

  async register(data: { personnelCode: string; mobile: string }) {
    const user = await this.prisma.user.findFirst({
      where: { personnelCode: data.personnelCode, mobile: data.mobile },
    })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    return { challengeId: user.id, message: 'OTP sent' }
  }

  async verifyOtp(data: { challengeId: string; code: string }) {
    if (data.code.length !== 6) throw new UnauthorizedException('Invalid OTP')
    const user = await this.prisma.user.findUnique({ where: { id: data.challengeId } })
    if (!user) throw new UnauthorizedException('User not found')
    return this.generateTokens(user.id)
  }

  async linkDevice(data: { token: string; deviceId: string; publicKey: string }) {
    try {
      const payload = jwt.verify(data.token, this.jwtSecret) as any
      await this.prisma.deviceRegistration.create({
        data: {
          userId: payload.sub,
          deviceId: data.deviceId,
          platform: 'WEB_PWA',
          publicKey: data.publicKey,
          status: 'ACTIVE',
        },
      })
      return { success: true, message: 'Device linked' }
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  async registerPushSubscription(
    userId: string,
    subscription: { endpoint: string; p256dh: string; auth: string }
  ) {
    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    })
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ sub: userId }, this.jwtSecret, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ sub: userId, type: 'refresh' }, this.jwtSecret, {
      expiresIn: '7d',
    })
    return { accessToken, refreshToken, expiresIn: 900 }
  }
}
