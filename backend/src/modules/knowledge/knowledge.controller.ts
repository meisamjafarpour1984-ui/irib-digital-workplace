import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger'
import { KnowledgeService } from './knowledge.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Knowledge')
@Controller('experts')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({
    summary: 'List experts',
    description:
      'Returns a list of experts with optional filtering by department and legend status. Results can be limited to a specific number of items.',
  })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiQuery({
    name: 'isLegend',
    required: false,
    description: 'Filter for legends only (true/false)',
    example: 'false',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of experts to return',
    example: '20',
  })
  @ApiResponse({ status: 200, description: 'Experts list retrieved successfully' })
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('isLegend') isLegend?: string,
    @Query('limit') limit?: string
  ) {
    return this.knowledgeService.getExperts({
      departmentId,
      isLegend: isLegend === 'true',
      limit: parseInt(limit || '20'),
    })
  }

  @Get('legends')
  @ApiOperation({
    summary: 'List legends',
    description:
      'Returns a list of legendary experts who have made significant contributions to the organization.',
  })
  @ApiResponse({ status: 200, description: 'Legends list retrieved successfully' })
  async getLegends() {
    return this.knowledgeService.getLegends()
  }

  @Get('skills/list')
  @ApiOperation({
    summary: 'List skills taxonomy',
    description: 'Returns the complete taxonomy of skills available in the expert database.',
  })
  @ApiResponse({ status: 200, description: 'Skills taxonomy retrieved successfully' })
  async getSkills() {
    return this.knowledgeService.getSkills()
  }

  @Get('skills/:slug')
  @ApiOperation({
    summary: 'Get skill by slug',
    description: 'Returns detailed information about a specific skill by its slug identifier.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Skill slug (URL-friendly identifier)',
    example: 'video-editing',
  })
  @ApiResponse({ status: 200, description: 'Skill details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async getSkillBySlug(@Param('slug') slug: string) {
    return this.knowledgeService.getSkillBySlug(slug)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get expert by ID',
    description: 'Returns detailed profile information for a specific expert by their ID.',
  })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  @ApiResponse({ status: 200, description: 'Expert profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Expert not found' })
  async findOne(@Param('id') id: string) {
    return this.knowledgeService.getExpertById(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update expert profile',
    description: 'Updates an expert profile information. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  @ApiResponse({ status: 200, description: 'Expert profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Expert not found' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.knowledgeService.updateExpert(id, body)
  }
}
