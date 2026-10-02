import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { SoftwareService } from './software.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Software')
@Controller('software')
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  @Get()
  @ApiOperation({
    summary: 'List software',
    description:
      'Returns a list of available software with optional filtering by category. Results can be limited to a specific number of items.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by software category',
    example: 'Utility',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of items to return',
    example: '20',
  })
  @ApiResponse({ status: 200, description: 'Software list retrieved successfully' })
  async findAll(@Query('category') category?: string, @Query('limit') limit?: string) {
    return this.softwareService.findAll({ category, limit: parseInt(limit || '20') })
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get software by ID',
    description: 'Returns detailed information about a specific software item by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Software ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Software details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Software not found' })
  async findOne(@Param('id') id: string) {
    return this.softwareService.findOne(id)
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get software center statistics',
    description: 'Returns aggregate statistics for software entries, versions, and downloads.',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.softwareService.getStats()
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload new software version',
    description: 'Creates a new software entry or adds a new version to an existing one.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'version', 'size', 'filename', 'storageKey', 'sha256'],
      properties: {
        name: { type: 'string' },
        description: { type: 'object' },
        icon: { type: 'string' },
        category: { type: 'string' },
        version: { type: 'string' },
        size: { type: 'number' },
        filename: { type: 'string' },
        storageKey: { type: 'string' },
        sha256: { type: 'string' },
        changelog: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Software uploaded successfully' })
  async upload(@Body() body: any) {
    return this.softwareService.upload(body)
  }

  @Post('downloads/log')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log software download',
    description:
      'Logs a software download event for analytics and tracking. Requires authentication.',
  })
  @ApiResponse({ status: 201, description: 'Download logged successfully' })
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
  @ApiOperation({
    summary: 'List support tickets',
    description: 'Returns a list of software support tickets with optional filtering by status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by ticket status',
    example: 'OPEN',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of tickets',
    example: '20',
  })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  async getTickets(@Query('status') status?: string, @Query('limit') limit?: string) {
    return this.softwareService.getTickets({ status, limit: parseInt(limit || '20') })
  }

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create support ticket',
    description: 'Creates a new software support ticket. Requires authentication.',
  })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async createTicket(
    @Body() body: { title: string; description: string; category: string },
    @Request() req: any
  ) {
    return this.softwareService.createTicket({ ...body, requesterId: req.user.sub })
  }
}
