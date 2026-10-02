import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { FormStatus, FormType, ScopeType } from '@prisma/client'
import { FormFieldType, SubmissionListQueryDto } from './dto/forms.dto'
import { FormsService } from './forms.service'

const definition = {
  id: 'form-1',
  slug: 'test-form',
  status: FormStatus.ACTIVE,
  jsonSchema: { fields: [{ id: 'name', type: FormFieldType.TEXT, label: 'نام', required: true }] },
}

describe('FormsService', () => {
  it('requires form.create permission', async () => {
    const prisma = { userRoleAssignment: { findMany: jest.fn().mockResolvedValue([]) } }
    const service = new FormsService(prisma as never)
    await expect(
      service.create({ title: 'فرم تست', formType: FormType.DATA_COLLECTION, fields: [] }, 'user-1')
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('does not expose an inactive form', async () => {
    const prisma = { formDefinition: { findFirst: jest.fn().mockResolvedValue(null) } }
    const service = new FormsService(prisma as never)
    await expect(service.getActive('draft-form')).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.formDefinition.findFirst).toHaveBeenCalledWith({
      where: { slug: 'draft-form', status: FormStatus.ACTIVE },
    })
  })

  it('rejects unknown submission fields', async () => {
    const prisma = {
      formDefinition: { findFirst: jest.fn().mockResolvedValue(definition) },
      formSubmission: { create: jest.fn() },
    }
    const service = new FormsService(prisma as never)
    await expect(
      service.submit('test-form', { name: 'کاربر', injected: true }, 'user-1')
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.formSubmission.create).not.toHaveBeenCalled()
  })

  it('accepts a valid submission and binds the JWT user', async () => {
    const prisma = {
      formDefinition: { findFirst: jest.fn().mockResolvedValue(definition) },
      formSubmission: { create: jest.fn().mockImplementation(({ data }) => data) },
    }
    const service = new FormsService(prisma as never)
    const result = await service.submit('test-form', { name: 'کاربر' }, 'user-1')
    expect(result).toMatchObject({
      formDefinitionId: 'form-1',
      submitterId: 'user-1',
      data: { name: 'کاربر' },
    })
  })

  it('requires a required checkbox to be checked', async () => {
    const checkboxDefinition = {
      ...definition,
      jsonSchema: {
        fields: [
          {
            id: 'confirmed',
            type: FormFieldType.CHECKBOX,
            label: 'تأیید',
            required: true,
          },
        ],
      },
    }
    const prisma = {
      formDefinition: { findFirst: jest.fn().mockResolvedValue(checkboxDefinition) },
      formSubmission: { create: jest.fn() },
    }
    const service = new FormsService(prisma as never)

    await expect(
      service.submit('test-form', { confirmed: false }, 'user-1')
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('accepts a global create role', async () => {
    const prisma = {
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            deniedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Form', action: 'CREATE' }] },
          },
        ]),
      },
      formDefinition: { create: jest.fn().mockImplementation(({ data }) => data) },
    }
    const service = new FormsService(prisma as never)
    await expect(
      service.create({ title: 'فرم تست', formType: FormType.DATA_COLLECTION, fields: [] }, 'user-1')
    ).resolves.toMatchObject({ createdBy: 'user-1' })
  })

  it('validates number field type with min/max constraints', async () => {
    const numberDefinition = {
      ...definition,
      jsonSchema: {
        fields: [
          {
            id: 'age',
            type: FormFieldType.NUMBER,
            label: 'سن',
            required: true,
            min: 18,
            max: 100,
          },
        ],
      },
    }
    const prisma = {
      formDefinition: { findFirst: jest.fn().mockResolvedValue(numberDefinition) },
      formSubmission: { create: jest.fn().mockImplementation(({ data }) => data) },
    }
    const service = new FormsService(prisma as never)

    await expect(service.submit('test-form', { age: 15 }, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException
    )

    const result = await service.submit('test-form', { age: 25 }, 'user-1')
    expect((result.data as Record<string, unknown>).age).toBe(25)
  })

  it('validates email field format', async () => {
    const emailDefinition = {
      ...definition,
      jsonSchema: {
        fields: [
          {
            id: 'email',
            type: FormFieldType.TEXT,
            label: 'ایمیل',
            required: true,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          },
        ],
      },
    }
    const prisma = {
      formDefinition: { findFirst: jest.fn().mockResolvedValue(emailDefinition) },
      formSubmission: { create: jest.fn().mockImplementation(({ data }) => data) },
    }
    const service = new FormsService(prisma as never)

    await expect(
      service.submit('test-form', { email: 'invalid-email' }, 'user-1')
    ).rejects.toBeInstanceOf(BadRequestException)

    const result = await service.submit('test-form', { email: 'test@example.com' }, 'user-1')
    expect((result.data as Record<string, unknown>).email).toBe('test@example.com')
  })

  it('paginates form submissions with listSubmissions', async () => {
    const prisma = {
      formDefinition: {
        findUnique: jest.fn().mockResolvedValue({ id: 'form-1', createdBy: 'admin-1' }),
      },
      formSubmission: {
        findMany: jest.fn().mockResolvedValue([
          { id: 's1', data: { name: 'کاربر ۱' } },
          { id: 's2', data: { name: 'کاربر ۲' } },
          { id: 's3', data: { name: 'کاربر ۳' } },
        ]),
        count: jest.fn().mockResolvedValue(42),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            deniedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Form', action: 'read' }] },
          },
        ]),
      },
    }
    const service = new FormsService(prisma as never)

    const result = await service.listSubmissions('form-1', 'admin-1', {
      page: 2,
      limit: 10,
      status: undefined,
    } as SubmissionListQueryDto)

    expect(prisma.formSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: { formDefinitionId: 'form-1' },
        orderBy: expect.any(Object),
      })
    )
    expect(result).toHaveLength(3)
  })

  it('requires read permission to view submissions', async () => {
    const prisma = {
      formDefinition: {
        findUnique: jest.fn().mockResolvedValue({ id: 'form-1', createdBy: 'other-user' }),
      },
      userRoleAssignment: { findMany: jest.fn().mockResolvedValue([]) },
    }
    const service = new FormsService(prisma as never)

    await expect(
      service.listSubmissions('form-1', 'user-1', {
        page: 1,
        limit: 10,
        status: undefined,
      } as SubmissionListQueryDto)
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('lists all forms for admin user', async () => {
    const prisma = {
      formDefinition: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'f1', title: 'فرم ۱' },
          { id: 'f2', title: 'فرم ۲' },
        ]),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            deniedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Form', action: 'read' }] },
          },
        ]),
      },
    }
    const service = new FormsService(prisma as never)

    const result = await service.list('admin-1')

    expect(prisma.formDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { createdBy: undefined },
        orderBy: { updatedAt: 'desc' },
      })
    )
    expect(result).toHaveLength(2)
  })
})
