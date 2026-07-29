import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OrganizationService } from './organization.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('tree')
  @ApiOperation({ summary: 'Get organization tree' })
  async getTree() {
    return this.organizationService.getTree()
  }

  @Get('units/:slug')
  @ApiOperation({ summary: 'Get unit by slug' })
  async getUnit(@Param('slug') slug: string) {
    return this.organizationService.getUnitBySlug(slug)
  }

  @Post('units')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create organization unit' })
  async createUnit(@Body() body: any) {
    return this.organizationService.create(body)
  }

  @Put('units/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization unit' })
  async updateUnit(@Param('id') id: string, @Body() body: any) {
    return this.organizationService.update(id, body)
  }

  @Get('microsites/:slug')
  @ApiOperation({ summary: 'Get microsite config' })
  async getMicrosite(@Param('slug') slug: string) {
    return this.organizationService.getMicrosite(slug)
  }
}
