import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LoginDto, RegisterDto, SetPinDto, VerifyOtpDto } from './dto/auth.dto'

const REFRESH_COOKIE = 'irib_refresh'

@ApiTags('IAM')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body)
  }

  @Post('dev-login')
  @ApiOperation({ summary: 'Development login without OTP (only for development)' })
  async devLogin(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.devLogin(body)
    this.setRefreshCookie(response, result.refreshToken, result.refreshExpiresAt)
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user }
  }

  @Post('keycloak-login')
  @ApiOperation({ summary: 'Keycloak direct login (for Keycloak authentication)' })
  async keycloakLogin(@Body() body: LoginDto, @Res({ passthrough: true }) _response: Response) {
    const result = await this.authService.keycloakLogin(body)
    // For Keycloak, we return the refresh token in the response body instead of cookie
    return result
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  async verifyOTP(@Body() body: VerifyOtpDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.verifyOtp(body)
    this.setRefreshCookie(response, result.refreshToken, result.refreshExpiresAt)
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refresh(request.cookies?.[REFRESH_COOKIE])
    this.setRefreshCookie(response, result.refreshToken, result.refreshExpiresAt)
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current refresh session' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.[REFRESH_COOKIE])
    response.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
    return { success: true }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() request: Request & { user: { sub: string } }) {
    return this.authService.getProfile(request.user.sub)
  }

  @Post('set-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set or replace the local six-digit PIN' })
  async setPin(@Req() request: Request & { user: { sub: string } }, @Body() body: SetPinDto) {
    await this.authService.setPin(request.user.sub, body.pin)
    return { success: true }
  }

  private setRefreshCookie(response: Response, token: string, expires: Date) {
    response.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/auth',
      expires,
    })
  }
}
