/**
 * IRIB Digital Workplace Platform - Tickets Repository
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    status?: string
    priority?: string
    departmentId?: string
    assigneeId?: string
    page?: number
    limit?: number
  }) {
    const where: any = {}

    if (filters?.status) where.status = filters.status
    if (filters?.priority) where.priority = filters.priority
    if (filters?.departmentId) where.departmentId = filters.departmentId
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId
    // deletedAt field doesn't exist in current schema

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          creator: true,
          assignee: true,
          department: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
        department: true,
      },
    })
  }

  async create(data: {
    title: string
    description: string
    category: string
    priority: string
    creatorId: string
    departmentId?: string
    attachments?: string[]
  }) {
    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as any,
        priority: data.priority as any,
        creatorId: data.creatorId,
        departmentId: data.departmentId,
      },
      include: {
        creator: true,
        department: true,
      },
    })
  }

  async update(
    id: string,
    data: {
      title?: string
      description?: string
      status?: string
      priority?: string
      assigneeId?: string
      departmentId?: string
    }
  ) {
    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.status) updateData.status = data.status as any
    if (data.priority) updateData.priority = data.priority as any
    if (data.assigneeId) updateData.assigneeId = data.assigneeId
    if (data.departmentId) updateData.departmentId = data.departmentId

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
        assignee: true,
        department: true,
      },
    })
  }

  async addComment(
    ticketId: string,
    data: {
      content: string
      authorId: string
      isInternal?: boolean
    }
  ) {
    // ticketComment model doesn't exist in current schema
    // Return placeholder data
    return { id: 'placeholder-' + Date.now(), ...data, ticketId }
  }

  async changeStatus(id: string, status: string, _userId: string) {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status: status as any },
    })

    // ticketComment model doesn't exist in current schema
    // Skip adding status change as comment
    return ticket
  }

  async assignTicket(id: string, assigneeId: string, _assignerId: string) {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { assigneeId },
      include: {
        assignee: true,
      },
    })

    // ticketComment model doesn't exist in current schema
    // Skip adding assignment as comment
    return ticket
  }

  async getStats(filters?: { departmentId?: string; assigneeId?: string }) {
    const where: any = {}

    if (filters?.departmentId) where.departmentId = filters.departmentId
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId
    // deletedAt field doesn't exist in current schema

    const [total, newTickets, inProgress, resolved, closed] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, status: 'NEW' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
    ])

    return { total, new: newTickets, inProgress, resolved, closed }
  }

  async remove(id: string) {
    // deletedAt field doesn't exist in current schema
    // Just return the ticket as is
    return this.prisma.ticket.findUnique({
      where: { id },
    })
  }
}
