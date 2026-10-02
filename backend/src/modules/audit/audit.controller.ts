/**
 * IRIB Digital Workplace Platform - Audit Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Delete, Body, Query, UseGuards, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity' })
  @RequirePermission('AuditLog.READ')
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditService.getUserActivity(userId, {
      page: parseInt(page || '1'),
      limit: parseInt(limit || '50'),
    })
  }

  @Get('entity/:entity')
  @ApiOperation({ summary: 'Get entity activity' })
  @RequirePermission('AuditLog.READ')
  async getEntityActivity(
    @Param('entity') entity: string,
    @Query('entityId') entityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pagination = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    }
    return this.auditService.getEntityActivity(entity, pagination, entityId)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  @RequirePermission('AuditLog.READ')
  async getStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.auditService.getAuditStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
  }

  @Get('search')
  @ApiOperation({ summary: 'Search audit logs' })
  @RequirePermission('AuditLog.READ')
  async getLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditService.getLogs({
      userId,
      action,
      entity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '50'),
    })
  }

  @Get('log/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @RequirePermission('AuditLog.READ')
  async getLogById(@Param('id') id: string) {
    return this.auditService.getLogById(id)
  }

  @Post('export')
  @ApiOperation({ summary: 'Export audit logs' })
  @RequirePermission('AuditLog.READ')
  async exportLogs(
    @Body()
    body: {
      userId?: string
      action?: string
      entity?: string
      startDate?: string
      endDate?: string
      format: 'json' | 'csv'
    }
  ) {
    return this.auditService.exportLogs({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    })
  }

  @Delete('cleanup')
  @ApiOperation({ summary: 'Cleanup old audit logs' })
  @RequirePermission('AuditLog.MANAGE')
  @Roles('ADMIN')
  async cleanupOldLogs(@Body() body: { daysToKeep?: number }) {
    return this.auditService.cleanupOldLogs(body.daysToKeep || 90)
  }
}
