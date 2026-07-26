import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'

const config = new ConfigService({
  JWT_SECRET: 'unit-test-secret-with-more-than-32-characters',
  JWT_ISSUER: 'irib-dwp',
  JWT_AUDIENCE: 'irib-dwp-web',
  NODE_ENV: 'test',
})

describe('AuthService', () => {
  it('fails fast when the signing secret is unsafe', () => {
    const originalSecret = process.env.JWT_SECRET
    delete process.env.JWT_SECRET
    try {
      expect(
        () => new AuthService({} as never, new ConfigService({ JWT_SECRET: 'short' }))
      ).toThrow('JWT_SECRET must contain at least 32 characters')
    } finally {
      process.env.JWT_SECRET = originalSecret
    }
  })

  it('rejects an invalid password before creating an OTP challenge', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          personnelCode: '12345',
          passwordHash: await bcrypt.hash('654321', 4),
          status: 'ACTIVE',
        }),
      },
      otpChallenge: { create: jest.fn() },
    }
    const service = new AuthService(prisma as never, config)

    await expect(
      service.login({ personnelCode: '12345', password: 'wrong-password' })
    ).rejects.toBeInstanceOf(UnauthorizedException)
    expect(prisma.otpChallenge.create).not.toHaveBeenCalled()
  })

  it('stores a hash instead of the plaintext PIN', async () => {
    const prisma = { user: { update: jest.fn().mockResolvedValue({}) } }
    const service = new AuthService(prisma as never, config)

    await service.setPin('user-1', '654321')

    const passwordHash = prisma.user.update.mock.calls[0][0].data.passwordHash as string
    expect(passwordHash).not.toBe('654321')
    await expect(bcrypt.compare('654321', passwordHash)).resolves.toBe(true)
  })

  it('hashes the development OTP challenge', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      otpChallenge: {
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockImplementation(({ data }) => ({ id: 'challenge-1', ...data })),
      },
    }
    const service = new AuthService(prisma as never, config)

    const result = await service.register({
      personnelCode: '12345',
      mobile: '09123456789',
      name: 'Test User',
    })

    expect(result).toMatchObject({ challengeId: 'challenge-1', devOtp: '123456' })
    const codeHash = prisma.otpChallenge.create.mock.calls[0][0].data.codeHash as string
    expect(codeHash).not.toBe('123456')
    await expect(bcrypt.compare('123456', codeHash)).resolves.toBe(true)
  })
})
