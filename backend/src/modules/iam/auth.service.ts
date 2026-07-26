import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes, randomInt } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from '../../prisma/prisma.service'
import type { LoginDto, RegisterDto, VerifyOtpDto } from './dto/auth.dto'

const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000
const OTP_TTL_MS = 2 * 60 * 1000
const OTP_RATE_WINDOW_MS = 10 * 60 * 1000
const OTP_RATE_LIMIT = 5

@Injectable()
export class AuthService {
  private readonly jwtSecret: string
  private readonly issuer: string
  private readonly audience: string
  private readonly isProduction: boolean

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService
  ) {
    const secret = config.get<string>('JWT_SECRET')
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters')
    }
    this.jwtSecret = secret
    this.issuer = config.get<string>('JWT_ISSUER', 'irib-dwp')
    this.audience = config.get<string>('JWT_AUDIENCE', 'irib-dwp-web')
    this.isProduction = config.get<string>('NODE_ENV') === 'production'
  }

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ personnelCode: data.personnelCode }, { mobile: data.mobile }] },
    })
    if (existing) {
      if (
        existing.status === 'PENDING' &&
        existing.personnelCode === data.personnelCode &&
        existing.mobile === data.mobile
      ) {
        return this.createOtpChallenge(existing.id, 'registration')
      }
      throw new ConflictException('User already exists')
    }

    const user = await this.prisma.user.create({
      data: {
        personnelCode: data.personnelCode,
        mobile: data.mobile,
        name: data.name ?? data.personnelCode,
        nameFa: data.name,
        status: 'PENDING',
      },
    })
    return this.createOtpChallenge(user.id, 'registration')
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { personnelCode: data.personnelCode } })
    if (!user?.passwordHash || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials')
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.createOtpChallenge(user.id, 'login')
  }

  async verifyOtp(data: VerifyOtpDto) {
    const challenge = await this.prisma.otpChallenge.findUnique({ where: { id: data.challengeId } })
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
      throw new UnauthorizedException('OTP challenge has expired')
    }
    if (challenge.attempts >= challenge.maxAttempts) {
      throw new HttpException('OTP attempt limit exceeded', HttpStatus.TOO_MANY_REQUESTS)
    }

    const valid = await bcrypt.compare(data.code, challenge.codeHash)
    if (!valid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      })
      throw new UnauthorizedException('Invalid OTP')
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.otpChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      })
      return tx.user.update({
        where: { id: challenge.userId },
        data: { status: 'ACTIVE', lastLoginAt: new Date() },
      })
    })
    return this.createSession(user.id)
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token is missing')
    const tokenHash = this.hashToken(refreshToken)
    const session = await this.prisma.authSession.findFirst({
      where: { refreshTokenHash: tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    })
    if (!session) throw new UnauthorizedException('Invalid refresh token')

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    })
    return this.createSession(session.userId)
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return
    await this.prisma.authSession.updateMany({
      where: { refreshTokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async setPin(userId: string, pin: string) {
    const passwordHash = await bcrypt.hash(pin, 12)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissions: true } } } },
        departments: { include: { department: true } },
      },
    })
    if (!user) throw new UnauthorizedException('User not found')

    const permissions = new Set<string>()
    user.roles.forEach(({ role }) => {
      role.permissions.forEach((permission) => {
        permissions.add(`${permission.entity}.${permission.action}`.toLowerCase())
      })
    })
    return {
      id: user.id,
      personnelCode: user.personnelCode,
      name: user.nameFa ?? user.name,
      email: user.email,
      mobile: user.mobile,
      departments: user.departments.map(({ department }) => ({
        id: department.id,
        name: department.name,
      })),
      roles: user.roles.map(({ role }) => role.code),
      permissions: [...permissions],
    }
  }

  private async createOtpChallenge(userId: string, purpose: string) {
    const recentChallenges = await this.prisma.otpChallenge.count({
      where: {
        userId,
        purpose,
        createdAt: { gte: new Date(Date.now() - OTP_RATE_WINDOW_MS) },
      },
    })
    if (recentChallenges >= OTP_RATE_LIMIT) {
      throw new HttpException('OTP request limit exceeded', HttpStatus.TOO_MANY_REQUESTS)
    }

    await this.prisma.otpChallenge.updateMany({
      where: { userId, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    })

    const code = this.isProduction ? randomInt(100000, 1000000).toString() : '123456'
    const challenge = await this.prisma.otpChallenge.create({
      data: {
        userId,
        purpose,
        codeHash: await bcrypt.hash(code, 10),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    })

    // The production SMS provider will consume this code in the Keycloak/provider phase.
    return {
      challengeId: challenge.id,
      expiresIn: OTP_TTL_MS / 1000,
      ...(!this.isProduction && { devOtp: code }),
    }
  }

  private async createSession(userId: string) {
    const refreshToken = randomBytes(48).toString('base64url')
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_MS)
    await this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: this.hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    })
    return {
      accessToken: jwt.sign({ sub: userId, type: 'access' }, this.jwtSecret, {
        expiresIn: ACCESS_TTL_SECONDS,
        issuer: this.issuer,
        audience: this.audience,
      }),
      refreshToken,
      refreshExpiresAt,
      expiresIn: ACCESS_TTL_SECONDS,
      user: await this.getProfile(userId),
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }
}
