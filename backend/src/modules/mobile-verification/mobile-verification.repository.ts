import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class MobileVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile: true,
        status: true,
      },
    })
  }

  async updateUserPhoneVerification(userId: string, _verified: boolean) {
    // Note: phoneVerified fields don't exist in current schema
    // For now, just return the user without verification update
    return this.prisma.user.findUnique({
      where: { id: userId },
    })
  }

  async updateUserMobile(userId: string, mobile: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        mobile,
      },
    })
  }

  async createOtpChallenge(data: {
    userId: string
    purpose: string
    codeHash: string
    expiresAt: Date
  }) {
    return this.prisma.otpChallenge.create({
      data,
    })
  }

  async findOtpChallenge(challengeId: string) {
    return this.prisma.otpChallenge.findUnique({
      where: { id: challengeId },
    })
  }

  async updateOtpChallenge(challengeId: string, data: any) {
    return this.prisma.otpChallenge.update({
      where: { id: challengeId },
      data,
    })
  }

  async invalidatePreviousChallenges(userId: string, purpose: string) {
    return this.prisma.otpChallenge.updateMany({
      where: {
        userId,
        purpose,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    })
  }

  async countRecentChallenges(userId: string, purpose: string, since: Date) {
    return this.prisma.otpChallenge.count({
      where: {
        userId,
        purpose,
        createdAt: { gte: since },
      },
    })
  }
}
