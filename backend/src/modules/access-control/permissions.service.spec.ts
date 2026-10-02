import { Test, TestingModule } from '@nestjs/testing'
import { PermissionsService } from './permissions.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('PermissionsService', () => {
  let service: PermissionsService
  let prismaService: PrismaService

  const mockPrismaService = {
    userRoleAssignment: {
      findMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    atomicPermission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<PermissionsService>(PermissionsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('checkPermission', () => {
    it('should return true for SUPER_ADMIN with GLOBAL scope', async () => {
      mockPrismaService.userRoleAssignment.findMany.mockResolvedValue([
        {
          roleId: 'role1',
          role: { code: 'SUPER_ADMIN' },
          scopeType: 'GLOBAL',
          deniedPermissions: [],
          grantedPermissions: [],
          scopeIds: [],
        },
      ])

      const result = await service.checkPermission('user123', 'Content', 'CREATE')
      expect(result).toBe(true)
    })

    it('should return false when permission is denied', async () => {
      mockPrismaService.userRoleAssignment.findMany.mockResolvedValue([
        {
          roleId: 'role1',
          role: { code: 'EMPLOYEE' },
          scopeType: 'GLOBAL',
          deniedPermissions: ['Content.DELETE'],
          grantedPermissions: [],
          scopeIds: [],
        },
      ])

      mockPrismaService.role.findUnique.mockResolvedValue({
        permissions: [{ entity: 'Content', action: 'DELETE' }],
      })

      const result = await service.checkPermission('user123', 'Content', 'DELETE')
      expect(result).toBe(false)
    })

    it('should return true when user has permission', async () => {
      mockPrismaService.userRoleAssignment.findMany.mockResolvedValue([
        {
          roleId: 'role1',
          role: { code: 'CONTENT_MANAGER' },
          scopeType: 'GLOBAL',
          deniedPermissions: [],
          grantedPermissions: [],
          scopeIds: [],
        },
      ])

      mockPrismaService.role.findUnique.mockResolvedValue({
        permissions: [{ entity: 'Content', action: 'CREATE' }],
      })

      const result = await service.checkPermission('user123', 'Content', 'CREATE')
      expect(result).toBe(true)
    })
  })

  describe('getEffectivePermissions', () => {
    it('should return all permissions for SUPER_ADMIN', async () => {
      mockPrismaService.userRoleAssignment.findMany.mockResolvedValue([
        {
          roleId: 'role1',
          role: { code: 'SUPER_ADMIN' },
          deniedPermissions: [],
          grantedPermissions: [],
          scopeIds: [],
        },
      ])

      const result = await service.getEffectivePermissions('user123')
      expect(result.permissions).toEqual(['*'])
      expect(result.scopes).toEqual(['*'])
    })

    it('should return effective permissions for regular user', async () => {
      mockPrismaService.userRoleAssignment.findMany.mockResolvedValue([
        {
          roleId: 'role1',
          role: {
            code: 'EMPLOYEE',
            permissions: [
              { entity: 'Content', action: 'READ' },
              { entity: 'FormSubmission', action: 'CREATE' },
            ],
          },
          deniedPermissions: [],
          grantedPermissions: [],
          scopeIds: ['dept-123'],
        },
      ])

      const result = await service.getEffectivePermissions('user123')
      expect(result.permissions).toContain('Content.READ')
      expect(result.permissions).toContain('FormSubmission.CREATE')
      expect(result.scopes).toContain('dept-123')
    })
  })

  describe('getPermissionMatrix', () => {
    it('should return permissions and roles', async () => {
      mockPrismaService.atomicPermission.findMany.mockResolvedValue([
        { id: '1', entity: 'Content', action: 'CREATE' },
        { id: '2', entity: 'Content', action: 'READ' },
      ])

      mockPrismaService.role.findMany.mockResolvedValue([
        {
          id: 'role1',
          code: 'ADMIN',
          permissions: [{ id: '1' }],
        },
      ])

      const result = await service.getPermissionMatrix()
      expect(result.permissions).toHaveLength(2)
      expect(result.roles).toHaveLength(1)
    })
  })
})
