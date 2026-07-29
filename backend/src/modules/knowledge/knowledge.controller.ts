import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { KnowledgeService } from './knowledge.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Knowledge')
@Controller('experts')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({ summary: 'List experts' })
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
  @ApiOperation({ summary: 'List legends' })
  async getLegends() {
    return this.knowledgeService.getLegends()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expert by ID' })
  async findOne(@Param('id') id: string) {
    return this.knowledgeService.getExpertById(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update expert profile' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.knowledgeService.updateExpert(id, body)
  }

  @Get('skills/list')
  @ApiOperation({ summary: 'List skills taxonomy' })
  async getSkills() {
    return this.knowledgeService.getSkills()
  }
}
