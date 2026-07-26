import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { ContentService } from './content.service'
import { ContentListQueryDto, CreateContentDto, UpdateContentDto } from './dto/content.dto'

type AuthenticatedRequest = Request & { user: { sub: string } }

@ApiTags('Content')
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('public/:slug')
  @ApiOperation({ summary: 'Get published content by slug' })
  findPublished(@Param('slug') slug: string) {
    return this.contentService.findPublished(slug)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List manageable content items' })
  findAll(@Req() request: AuthenticatedRequest, @Query() query: ContentListQueryDto) {
    return this.contentService.findAll(query, request.user.sub)
  }

  @Get('options/departments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active departments for content scope selection' })
  listDepartments(@Req() request: AuthenticatedRequest) {
    return this.contentService.listDepartments(request.user.sub)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get content by ID' })
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.findOne(id, request.user.sub)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a content draft' })
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateContentDto) {
    return this.contentService.create(body, request.user.sub)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update content and preserve a version snapshot' })
  update(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateContentDto
  ) {
    return this.contentService.update(id, body, request.user.sub)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete content' })
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.remove(id, request.user.sub)
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish content' })
  publish(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.publish(id, request.user.sub)
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive content' })
  archive(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.archive(id, request.user.sub)
  }
}
