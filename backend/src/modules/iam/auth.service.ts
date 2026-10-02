import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from '../../prisma/prisma.service'
import type { LoginDto, RegisterDto, VerifyOtpDto } from './dto/auth.dto'
import { MobileVerificationService } from '../mobile-verification/mobile-verification.service'
import { KeycloakService } from './keycloak.service'

const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly jwtSecret: string
  private readonly issuer: string
  private readonly audience: string
  private readonly isProduction: boolean
  private readonly useKeycloak: boolean

  constructor(
    private readonly prisma: PrismaService,
    private readonly mobileVerificationService: MobileVerificationService,
    private readonly keycloakService: KeycloakService,
    private readonly config: ConfigService
  ) {
    const secret = this.config.get<string>('JWT_SECRET')
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters')
    }
    this.jwtSecret = secret
    this.issuer = this.config.get<string>('JWT_ISSUER', 'irib-dwp')
    this.audience = this.config.get<string>('JWT_AUDIENCE', 'irib-dwp-web')
    this.isProduction = this.config.get<string>('NODE_ENV') === 'production'
    this.useKeycloak = this.config.get<string>('AUTH_TYPE', 'local') === 'keycloak'
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
    // If Keycloak is enabled, use Keycloak login
    if (this.useKeycloak) {
      return this.keycloakLogin(data)
    }

    // Otherwise, use local JWT login
    const user = await this.prisma.user.findUnique({ where: { personnelCode: data.personnelCode } })
    if (!user?.passwordHash || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials')
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.createOtpChallenge(user.id, 'login')
  }

  async keycloakLogin(data: LoginDto) {
    try {
      const keycloakUrl = this.config.get<string>('KEYCLOAK_URL', 'http://localhost:8080')
      const keycloakRealm = this.config.get<string>('KEYCLOAK_REALM', 'irib-dwp')
      const keycloakClientId = this.config.get<string>('KEYCLOAK_CLIENT_ID', 'irib-dwp-web')
      const keycloakClientSecret = this.config.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'irib-dwp-client-secret'
      )

      // Try to authenticate with Keycloak
      const response = await fetch(
        `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: keycloakClientId,
            client_secret: keycloakClientSecret,
            username: data.personnelCode,
            password: data.password,
          }),
        }
      )

      if (!response.ok) {
        throw new UnauthorizedException('Invalid Keycloak credentials')
      }

      const keycloakResponse = await response.json()

      // Get user info from Keycloak
      const userInfo = await this.keycloakService.getUserInfo(keycloakResponse.access_token)

      // Find or create user in database
      let user = await this.prisma.user.findFirst({
        where: { keycloakId: userInfo.id },
      })

      if (!user) {
        // Create user if not exists
        user = await this.prisma.user.create({
          data: {
            personnelCode: userInfo.username,
            name: userInfo.givenName || userInfo.name,
            nameFa: userInfo.familyName || '',
            email: userInfo.email,
            status: 'ACTIVE',
            keycloakId: userInfo.id,
            keycloakSyncedAt: new Date(),
          },
        })
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      // Return Keycloak tokens
      return {
        accessToken: keycloakResponse.access_token,
        refreshToken: keycloakResponse.refresh_token,
        expiresIn: keycloakResponse.expires_in,
        user: {
          id: user.id,
          personnelCode: user.personnelCode,
          name: user.name,
          nameFa: user.nameFa,
          email: user.email,
          roles: userInfo.roles,
        },
      }
    } catch (error) {
      this.logger.error('Keycloak login error:', error)
      throw new UnauthorizedException('Keycloak authentication failed')
    }
  }

  async devLogin(data: LoginDto) {
    // Development-only login without OTP
    if (this.isProduction) {
      throw new UnauthorizedException('Dev login is only available in development mode')
    }

    const user = await this.prisma.user.findUnique({ where: { personnelCode: data.personnelCode } })
    if (!user?.passwordHash || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials')
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Create session directly without OTP
    return this.createSession(user.id)
  }

  async verifyOtp(data: VerifyOtpDto) {
    // Delegate OTP verification to MobileVerificationService
    const verification = await this.mobileVerificationService.verifyOtp(data.challengeId, data.code)

    if (!verification.success) {
      throw new UnauthorizedException('OTP verification failed')
    }

    // Update user status and create session
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: data.challengeId },
    })
    if (!challenge) {
      throw new UnauthorizedException('Invalid challenge')
    }

    const user = await this.prisma.user.update({
      where: { id: challenge.userId },
      data: {
        status: 'ACTIVE',
        lastLoginAt: new Date(),
      },
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
    const passwordHash = await bcrypt.hash(pin, 10)
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mobile: true },
    })

    if (!user?.mobile) {
      throw new HttpException('Mobile number not found', HttpStatus.BAD_REQUEST)
    }

    // Delegate OTP creation and SMS sending to MobileVerificationService
    return this.mobileVerificationService.sendOtp(userId, user.mobile, purpose)
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
