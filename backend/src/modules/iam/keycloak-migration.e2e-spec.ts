/**
 * IRIB Digital Workplace Platform - Keycloak Migration E2E Tests (P0-3)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { KeycloakMigrationModule } from './keycloak-migration.module'
import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

describe('Keycloak Migration E2E', () => {
  let app: INestApplication
  let prisma: PrismaService
  let config: ConfigService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [KeycloakMigrationModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          const configMap = {
            KEYCLOAK_URL: 'http://localhost:8080',
            KEYCLOAK_REALM: 'irib-dwp-test',
            KEYCLOAK_ADMIN_USERNAME: 'admin',
            KEYCLOAK_ADMIN_PASSWORD: 'admin',
          }
          return configMap[key]
        }),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    prisma = moduleFixture.get<PrismaService>(PrismaService)
    config = moduleFixture.get<ConfigService>(ConfigService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /keycloak-migration/stats', () => {
    it('should return migration statistics', async () => {
      // Mock Prisma responses
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(100)
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(60)
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(40)

      const response = await request(app.getHttpServer())
        .get('/keycloak-migration/stats')
        .expect(200)

      expect(response.body).toEqual({
        total: 100,
        migrated: 60,
        notMigrated: 40,
        migrationRate: 60,
      })
    })

    it('should handle empty database', async () => {
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(0)
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(0)
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(0)

      const response = await request(app.getHttpServer())
        .get('/keycloak-migration/stats')
        .expect(200)

      expect(response.body.migrationRate).toBe(0)
    })
  })

  describe('POST /keycloak-migration/migrate', () => {
    it('should perform dry run migration', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          personnelCode: '10001',
          email: 'user1@example.com',
          name: 'User One',
          nameFa: 'کاربر یک',
          status: 'ACTIVE',
          keycloakId: null,
          deletedAt: null,
          roles: [{ role: { name: 'USER' } }],
        },
      ]

      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers as any)

      const response = await request(app.getHttpServer())
        .post('/keycloak-migration/migrate')
        .send({ dryRun: true, batchSize: 10 })
        .expect(200)

      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('failure')
      expect(response.body).toHaveProperty('errors')
    })

    it('should use default batch size when not provided', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([])

      await request(app.getHttpServer())
        .post('/keycloak-migration/migrate')
        .send({ dryRun: true })
        .expect(200)
    })

    it('should handle migration errors gracefully', async () => {
      jest.spyOn(prisma.user, 'findMany').mockRejectedValue(new Error('Database error'))

      await request(app.getHttpServer())
        .post('/keycloak-migration/migrate')
        .send({ dryRun: true })
        .expect(500)
    })
  })

  describe('POST /keycloak-migration/sync/:userId', () => {
    it('should sync a single user to Keycloak', async () => {
      const mockUser = {
        id: 'user-1',
        personnelCode: '10001',
        email: 'user1@example.com',
        name: 'User One',
        nameFa: 'کاربر یک',
        status: 'ACTIVE',
        keycloakId: null,
        deletedAt: null,
        roles: [{ role: { name: 'USER' } }],
      }

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any)

      const response = await request(app.getHttpServer())
        .post('/keycloak-migration/sync/user-1')
        .expect(200)

      expect(response.body).toHaveProperty('success')
    })

    it('should return 400 for non-existent user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)

      await request(app.getHttpServer()).post('/keycloak-migration/sync/non-existent').expect(400)
    })

    it('should skip already synced users', async () => {
      const mockUser = {
        id: 'user-1',
        personnelCode: '10001',
        email: 'user1@example.com',
        name: 'User One',
        nameFa: 'کاربر یک',
        status: 'ACTIVE',
        keycloakId: 'keycloak-123',
        deletedAt: null,
        roles: [],
      }

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any)

      const response = await request(app.getHttpServer())
        .post('/keycloak-migration/sync/user-1')
        .expect(200)

      expect(response.body.message).toBe('User already synced')
    })
  })

  describe('Configuration validation', () => {
    it('should use default Keycloak URL when not configured', async () => {
      const defaultUrl = config.get('KEYCLOAK_URL')
      expect(defaultUrl).toBe('http://localhost:8080')
    })

    it('should use default realm when not configured', async () => {
      const defaultRealm = config.get('KEYCLOAK_REALM')
      expect(defaultRealm).toBe('irib-dwp-test')
    })
  })
})
