import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SoftwareService } from './software.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Software')
@Controller()
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  @Get('software')
  @ApiOperation({ summary: 'List software' })
  async findAll(@Query('category') category?: string, @Query('limit') limit?: string) {
    return this.softwareService.findAll({ category, limit: parseInt(limit || '20') })
  }

  @Get('software/:id')
  @ApiOperation({ summary: 'Get software by ID' })
  async findOne(@Param('id') id: string) {
    return this.softwareService.findOne(id)
  }

  @Post('downloads/log')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log software download' })
  async logDownload(@Body() body: { versionId: string }, @Request() req: any) {
    return this.softwareService.logDownload(
      body.versionId,
      req.user.sub,
      req.ip,
      req.headers['user-agent']
    )
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List tickets' })
  async getTickets(@Query('status') status?: string, @Query('limit') limit?: string) {
    return this.softwareService.getTickets({ status, limit: parseInt(limit || '20') })
  }

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create ticket' })
  async createTicket(
    @Body() body: { title: string; description: string; category: string },
    @Request() req: any
  ) {
    return this.softwareService.createTicket({ ...body, requesterId: req.user.sub })
  }
}
