import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { FormStatus, FormType, ScopeType } from '@prisma/client'
import { FormFieldType } from './dto/forms.dto'
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
})
