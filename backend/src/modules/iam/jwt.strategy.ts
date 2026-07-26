import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

export interface AccessTokenPayload {
  sub: string
  type: 'access'
  issuer: string
  audience: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET')
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: config.get<string>('JWT_ISSUER', 'irib-dwp'),
      audience: config.get<string>('JWT_AUDIENCE', 'irib-dwp-web'),
    })
  }

  validate(payload: AccessTokenPayload) {
    if (payload.type !== 'access') {
      return null
    }
    return { sub: payload.sub }
  }
}
