/**
 * IRIB Digital Workplace Platform - Afish Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Put, Param, Body, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AfishStatus, Prisma } from '@prisma/client'
import type { Request } from 'express'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { AfishService } from './afish.service'

type AuthenticatedRequest = Request & { user: { sub: string } }

@ApiTags('Afish')
@Controller('afish')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AfishController {
  constructor(private readonly afishService: AfishService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Afish record' })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() body: { formDefinitionId: string; rowData: Prisma.InputJsonValue }
  ) {
    return this.afishService.createAfishRecord(
      body.formDefinitionId,
      body.rowData,
      request.user.sub
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Afish record by ID' })
  async get(@Param('id') id: string) {
    return this.afishService.getAfishRecord(id)
  }

  @Get()
  @ApiOperation({ summary: 'List Afish records' })
  async list(
    @Query('formDefinitionId') formDefinitionId?: string,
    @Query('status') status?: AfishStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.afishService.listAfishRecords({
      formDefinitionId,
      status,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    })
  }

  @Put(':id/lock')
  @ApiOperation({ summary: 'Lock an Afish record for editing' })
  async lock(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.afishService.lockAfishRecord(id, request.user.sub)
  }

  @Put(':id/unlock')
  @ApiOperation({ summary: 'Unlock an Afish record' })
  async unlock(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.afishService.unlockAfishRecord(id, request.user.sub)
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Submit Afish record for approval' })
  async submit(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.afishService.submitForApproval(id, request.user.sub)
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve an Afish record' })
  async approve(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.afishService.approveAfishRecord(id, request.user.sub)
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject an Afish record' })
  async reject(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.afishService.rejectAfishRecord(id, request.user.sub)
  }

  @Put(':id/archive')
  @ApiOperation({ summary: 'Archive an Afish record' })
  async archive(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.afishService.archiveAfishRecord(id, request.user.sub)
  }

  @Put(':id/data')
  @ApiOperation({ summary: 'Update Afish record data' })
  async updateData(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: { rowData: any }
  ) {
    return this.afishService.updateAfishRecord(id, body.rowData, request.user.sub)
  }

  @Put(':id/pdf')
  @ApiOperation({ summary: 'Update PDF URL for Afish record' })
  async updatePdf(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: { pdfUrl: string }
  ) {
    return this.afishService.updatePdfUrl(id, body.pdfUrl, request.user.sub)
  }
}
