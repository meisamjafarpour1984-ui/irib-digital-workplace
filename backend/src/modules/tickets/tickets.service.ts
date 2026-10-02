/**
 * IRIB Digital Workplace Platform - Tickets Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { TicketsRepository } from './tickets.repository'

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name)

  constructor(private readonly ticketsRepository: TicketsRepository) {}

  /**
   * Get all tickets with filters
   */
  async findAll(filters?: {
    status?: string
    priority?: string
    departmentId?: string
    assigneeId?: string
    page?: number
    limit?: number
  }) {
    return this.ticketsRepository.findAll(filters)
  }

  /**
   * Get ticket by ID
   */
  async findOne(id: string) {
    return this.ticketsRepository.findOne(id)
  }

  /**
   * Create new ticket
   */
  async create(data: {
    title: string
    description: string
    category: string
    priority: string
    creatorId: string
    departmentId?: string
    attachments?: string[]
  }) {
    return this.ticketsRepository.create(data)
  }

  /**
   * Update ticket
   */
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
    return this.ticketsRepository.update(id, data)
  }

  /**
   * Add comment to ticket
   */
  async addComment(
    ticketId: string,
    data: {
      content: string
      authorId: string
      isInternal?: boolean
    }
  ) {
    return this.ticketsRepository.addComment(ticketId, data)
  }

  /**
   * Change ticket status
   */
  async changeStatus(id: string, status: string, userId: string) {
    return this.ticketsRepository.changeStatus(id, status, userId)
  }

  /**
   * Assign ticket to user
   */
  async assignTicket(id: string, assigneeId: string, assignerId: string) {
    return this.ticketsRepository.assignTicket(id, assigneeId, assignerId)
  }

  /**
   * Get ticket statistics
   */
  async getStats(filters?: { departmentId?: string; assigneeId?: string }) {
    return this.ticketsRepository.getStats(filters)
  }

  /**
   * Delete ticket (soft delete)
   */
  async remove(id: string) {
    return this.ticketsRepository.remove(id)
  }
}
