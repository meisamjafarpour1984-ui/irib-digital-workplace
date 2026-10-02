/**
 * IRIB Digital Workplace Platform - Afish Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { AfishStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AfishService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new Afish record from form submission
   */
  async createAfishRecord(
    formDefinitionId: string,
    rowData: Prisma.InputJsonValue,
    userId: string
  ) {
    const form = await this.prisma.formDefinition.findUnique({
      where: { id: formDefinitionId },
    })

    if (!form) {
      throw new NotFoundException('Form definition not found')
    }

    if (form.formType !== 'AFISH_STRUCTURED') {
      throw new BadRequestException('Form is not an Afish form')
    }

    // Generate record number: AFISH-YYYY-XXXX
    const year = new Date().getFullYear()
    const count = await this.prisma.afishRecord.count({
      where: {
        recordNumber: {
          startsWith: `AFISH-${year}`,
        },
      },
    })
    const recordNumber = `AFISH-${year}-${String(count + 1).padStart(4, '0')}`

    return this.prisma.afishRecord.create({
      data: {
        formDefinitionId,
        recordNumber,
        rowData,
        status: AfishStatus.DRAFT,
        createdById: userId,
      },
    })
  }

  /**
   * Lock an Afish record for editing
   */
  async lockAfishRecord(id: string, _userId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.status !== AfishStatus.DRAFT) {
      throw new BadRequestException('Only draft records can be locked')
    }

    if (record.lockedAt && record.lockedAt > new Date(Date.now() - 30 * 60 * 1000)) {
      throw new BadRequestException('Record is already locked by another user')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        lockedAt: new Date(),
      },
    })
  }

  /**
   * Unlock an Afish record
   */
  async unlockAfishRecord(id: string, userId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.createdById !== userId) {
      throw new ForbiddenException('Only the creator can unlock the record')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        lockedAt: null,
      },
    })
  }

  /**
   * Submit an Afish record for approval
   */
  async submitForApproval(id: string, userId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.createdById !== userId) {
      throw new ForbiddenException('Only the creator can submit for approval')
    }

    if (record.status !== AfishStatus.DRAFT) {
      throw new BadRequestException('Only draft records can be submitted')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        status: AfishStatus.LOCKED,
        lockedAt: new Date(),
      },
    })
  }

  /**
   * Approve an Afish record
   */
  async approveAfishRecord(id: string, approverId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.status !== AfishStatus.LOCKED) {
      throw new BadRequestException('Only locked records can be approved')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        status: AfishStatus.PRINTED,
        approvedById: approverId,
        printedAt: new Date(),
        lockedAt: null,
      },
    })
  }

  /**
   * Reject an Afish record
   */
  async rejectAfishRecord(id: string, _approverId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.status !== AfishStatus.LOCKED) {
      throw new BadRequestException('Only locked records can be rejected')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        status: AfishStatus.DRAFT,
        approvedById: null,
        lockedAt: null,
      },
    })
  }

  /**
   * Archive an Afish record
   */
  async archiveAfishRecord(id: string, userId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.createdById !== userId) {
      throw new ForbiddenException('Only the creator can archive the record')
    }

    if (record.status !== AfishStatus.PRINTED) {
      throw new BadRequestException('Only printed records can be archived')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        status: AfishStatus.ARCHIVED,
      },
    })
  }

  /**
   * Get Afish record by ID
   */
  async getAfishRecord(id: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
      include: {
        formDefinition: true,
        creator: {
          select: {
            id: true,
            name: true,
            personnelCode: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            personnelCode: true,
          },
        },
      },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    return record
  }

  /**
   * List Afish records
   */
  async listAfishRecords(params: {
    formDefinitionId?: string
    status?: AfishStatus
    limit?: number
    offset?: number
  }) {
    const { formDefinitionId, status, limit = 50, offset = 0 } = params

    const where: Prisma.AfishRecordWhereInput = {
      ...(formDefinitionId && { formDefinitionId }),
      ...(status && { status }),
    }

    const [records, total] = await Promise.all([
      this.prisma.afishRecord.findMany({
        where,
        include: {
          formDefinition: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              personnelCode: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
              personnelCode: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.afishRecord.count({ where }),
    ])

    return {
      records,
      total,
      limit,
      offset,
    }
  }

  /**
   * Update Afish record data
   */
  async updateAfishRecord(id: string, rowData: any, userId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.createdById !== userId) {
      throw new ForbiddenException('Only the creator can update the record')
    }

    if (record.status !== AfishStatus.DRAFT) {
      throw new BadRequestException('Only draft records can be updated')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        rowData: rowData as Prisma.InputJsonObject,
      },
    })
  }

  /**
   * Update PDF URL for Afish record
   */
  async updatePdfUrl(id: string, pdfUrl: string, userId: string) {
    const record = await this.prisma.afishRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Afish record not found')
    }

    if (record.createdById !== userId) {
      throw new ForbiddenException('Only the creator can update the PDF URL')
    }

    return this.prisma.afishRecord.update({
      where: { id },
      data: {
        pdfUrl,
      },
    })
  }
}
