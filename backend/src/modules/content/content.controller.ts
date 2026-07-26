import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ContentService } from './content.service'

@ApiTags('Content')
@ApiBearerAuth()
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'List all content items' })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.contentService.findAll({ type, status, page: page || 1, limit: limit || 10 })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  async create(@Body() data: any) {
    return this.contentService.create(data)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.contentService.update(id, data)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content (soft)' })
  async remove(@Param('id') id: string) {
    return this.contentService.remove(id)
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish content' })
  async publish(@Param('id') id: string) {
    return this.contentService.publish(id)
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive content' })
  async archive(@Param('id') id: string) {
    return this.contentService.archive(id)
  }
}
