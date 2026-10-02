/**
 * IRIB Digital Workplace Platform - Tickets Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TicketsService } from './tickets.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tickets' })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('departmentId') departmentId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.ticketsService.findAll({
      status,
      priority,
      departmentId,
      assigneeId,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
    })
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  async getStats(
    @Query('departmentId') departmentId?: string,
    @Query('assigneeId') assigneeId?: string
  ) {
    return this.ticketsService.getStats({ departmentId, assigneeId })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create new ticket' })
  async create(
    @Body()
    data: {
      title: string
      description: string
      category: string
      priority: string
      creatorId: string
      departmentId?: string
      attachments?: string[]
    }
  ) {
    return this.ticketsService.create(data)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.update(id, data)
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Change ticket status' })
  async changeStatus(@Param('id') id: string, @Body() data: { status: string; userId: string }) {
    return this.ticketsService.changeStatus(id, data.status, data.userId)
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to user' })
  async assignTicket(
    @Param('id') id: string,
    @Body() data: { assigneeId: string; assignerId: string }
  ) {
    return this.ticketsService.assignTicket(id, data.assigneeId, data.assignerId)
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to ticket' })
  async addComment(
    @Param('id') id: string,
    @Body()
    data: {
      content: string
      authorId: string
      isInternal?: boolean
    }
  ) {
    return this.ticketsService.addComment(id, data)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.ticketsService.remove(id)
  }
}
