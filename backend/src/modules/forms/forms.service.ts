import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { FormStatus, Prisma, ScopeType, SubmissionStatus } from '@prisma/client'
import { randomUUID } from 'crypto'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateFormDto, FormFieldDto, FormFieldType, SubmissionListQueryDto } from './dto/forms.dto'

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive(slug: string) {
    const form = await this.prisma.formDefinition.findFirst({
      where: { slug, status: FormStatus.ACTIVE },
    })
    if (!form) throw new NotFoundException('Active form not found')
    return form
  }

  async list(userId: string) {
    const canReadAll = await this.hasPermission(userId, 'read')
    return this.prisma.formDefinition.findMany({
      where: { createdBy: canReadAll ? undefined : userId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        status: true,
        formType: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async create(data: CreateFormDto, userId: string) {
    await this.requirePermission(userId, 'create')
    this.validateDefinition(data.fields)
    return this.prisma.formDefinition.create({
      data: {
        slug: `${this.slugify(data.title)}-${randomUUID().slice(0, 8)}`,
        title: { fa: data.title.trim() },
        description: data.description ? { fa: data.description.trim() } : undefined,
        formType: data.formType,
        jsonSchema: { fields: data.fields } as unknown as Prisma.InputJsonValue,
        uiSchema: { mode: 'single' },
        workflowConfig: {},
        createdBy: userId,
      },
    })
  }

  async activate(id: string, userId: string) {
    await this.requirePermission(userId, 'publish')
    const form = await this.prisma.formDefinition.findUnique({ where: { id } })
    if (!form) throw new NotFoundException('Form not found')
    return this.prisma.formDefinition.update({ where: { id }, data: { status: FormStatus.ACTIVE } })
  }

  async submit(slug: string, data: Record<string, unknown>, userId: string) {
    const form = await this.getActive(slug)
    const fields = this.fields(form.jsonSchema)
    this.validateSubmission(fields, data)
    return this.prisma.formSubmission.create({
      data: {
        formDefinitionId: form.id,
        data: data as Prisma.InputJsonObject,
        status: SubmissionStatus.SUBMITTED,
        submitterId: userId,
        submittedAt: new Date(),
      },
    })
  }

  async listSubmissions(id: string, userId: string, query: SubmissionListQueryDto) {
    const form = await this.prisma.formDefinition.findUnique({ where: { id } })
    if (!form) throw new NotFoundException('Form not found')
    if (form.createdBy !== userId) await this.requirePermission(userId, 'read')
    return this.prisma.formSubmission.findMany({
      where: {
        formDefinitionId: id,
        ...(query.status ? { status: query.status } : {}),
      },
      include: {
        submitter: { select: { id: true, name: true } },
        formDefinition: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: ((query.page ?? 1) - 1) * query.limit,
      take: query.limit,
    })
  }

  private validateDefinition(fields: FormFieldDto[]) {
    const ids = new Set<string>()
    fields.forEach((field) => {
      if (ids.has(field.id)) throw new BadRequestException(`Duplicate field id: ${field.id}`)
      ids.add(field.id)
      if (field.type === FormFieldType.SELECT && (!field.options || field.options.length === 0))
        throw new BadRequestException(`Select field ${field.id} requires options`)
    })
  }

  private fields(schema: Prisma.JsonValue): FormFieldDto[] {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema))
      throw new BadRequestException('Invalid form schema')
    const fields = (schema as Prisma.JsonObject).fields
    if (!Array.isArray(fields)) throw new BadRequestException('Invalid form schema')
    return fields as unknown as FormFieldDto[]
  }

  private validateSubmission(fields: FormFieldDto[], data: Record<string, unknown>) {
    const allowed = new Set(fields.map(({ id }) => id))
    Object.keys(data).forEach((key) => {
      if (!allowed.has(key)) throw new BadRequestException(`Unknown form field: ${key}`)
    })
    fields.forEach((field) => {
      const value = data[field.id]
      const requiredBooleanMissing =
        [FormFieldType.CHECKBOX, FormFieldType.TOGGLE].includes(field.type) && value !== true
      if (
        field.required &&
        (value === undefined || value === null || value === '' || requiredBooleanMissing)
      )
        throw new BadRequestException(`Field ${field.id} is required`)
      if (value === undefined || value === null || value === '') return
      if (
        [
          FormFieldType.TEXT,
          FormFieldType.TEXTAREA,
          FormFieldType.DATE,
          FormFieldType.SELECT,
        ].includes(field.type) &&
        typeof value !== 'string'
      )
        throw new BadRequestException(`Field ${field.id} must be text`)
      if (
        field.type === FormFieldType.NUMBER &&
        (typeof value !== 'number' || !Number.isFinite(value))
      )
        throw new BadRequestException(`Field ${field.id} must be a number`)
      const fieldConstraints = field as FormFieldDto & {
        min?: number
        max?: number
        pattern?: string
      }
      if (
        field.type === FormFieldType.NUMBER &&
        fieldConstraints.min !== undefined &&
        (value as number) < fieldConstraints.min
      )
        throw new BadRequestException(`Field ${field.id} is below minimum`)
      if (
        field.type === FormFieldType.NUMBER &&
        fieldConstraints.max !== undefined &&
        (value as number) > fieldConstraints.max
      )
        throw new BadRequestException(`Field ${field.id} exceeds maximum`)
      if (fieldConstraints.pattern !== undefined) {
        let pattern: RegExp
        try {
          pattern = new RegExp(fieldConstraints.pattern)
        } catch {
          throw new BadRequestException(`Field ${field.id} has an invalid pattern`)
        }
        if (typeof value !== 'string' || !pattern.test(value))
          throw new BadRequestException(`Field ${field.id} has an invalid format`)
      }
      if (
        [FormFieldType.CHECKBOX, FormFieldType.TOGGLE].includes(field.type) &&
        typeof value !== 'boolean'
      )
        throw new BadRequestException(`Field ${field.id} must be boolean`)
      if (field.type === FormFieldType.SELECT && !field.options?.includes(value as string))
        throw new BadRequestException(`Field ${field.id} has an invalid option`)
      if (
        field.type === FormFieldType.DATE &&
        (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      )
        throw new BadRequestException(`Field ${field.id} must be a valid date`)
    })
  }

  private async requirePermission(userId: string, action: string) {
    if (!(await this.hasPermission(userId, action))) {
      throw new ForbiddenException(`Form ${action} permission is required`)
    }
  }

  private async hasPermission(userId: string, action: string) {
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: { role: { include: { permissions: true } } },
    })
    return assignments.some(
      ({ scopeType, deniedPermissions, role }) =>
        scopeType === ScopeType.GLOBAL &&
        role.permissions.some(
          (permission) =>
            !deniedPermissions.includes(permission.id) &&
            permission.entity.toLowerCase() === 'form' &&
            (permission.action.toLowerCase() === action || permission.action === '*')
        )
    )
  }

  private slugify(value: string) {
    return (
      value
        .normalize('NFKC')
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'form'
    )
  }
}
