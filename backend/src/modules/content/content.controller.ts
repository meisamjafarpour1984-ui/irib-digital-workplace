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
  Logger,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { ContentService } from './content.service'
import { ContentListQueryDto, CreateContentDto, UpdateContentDto } from './dto/content.dto'

type AuthenticatedRequest = Request & { user: { sub: string } }

@ApiTags('Content')
@Controller('contents')
export class ContentController {
  private readonly logger = new Logger(ContentController.name)

  constructor(private readonly contentService: ContentService) {}

  // IMPORTANT: Static routes must be defined BEFORE parameterized routes
  // Otherwise NestJS will match parameterized routes first

  @Get('options/departments')
  @ApiOperation({
    summary: 'List active departments for content scope selection',
    description:
      'Retrieves a list of active departments that can be used as content scope options. This is typically used in dropdown selectors when creating or editing content. Returns an array of department objects with ID and name.',
  })
  @ApiResponse({
    status: 200,
    description: 'Departments list retrieved successfully',
  })
  listDepartments() {
    this.logger.log(`=== CONTROLLER: listDepartments called (no auth) ===`)
    return this.contentService.listDepartments('anonymous')
  }

  @Get('feed')
  @ApiOperation({
    summary: 'List published content for portal widgets (public)',
    description:
      'Retrieves a paginated list of published content items suitable for portal widgets. This endpoint is publicly accessible and supports filtering by content type. Returns an array of content items with pagination metadata.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter content by type (e.g., news, announcement, event)',
    type: String,
    example: 'news',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of items to return per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (starts from 1)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Content list retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  listPublicFeed(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string
  ) {
    return this.contentService.listPublicFeed({
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    })
  }

  @Get('public/:slug')
  @ApiOperation({
    summary: 'Get published content by slug',
    description:
      'Retrieves a published content item by its unique slug. This endpoint is publicly accessible and does not require authentication. Returns the content details including title, body, metadata, and related information.',
  })
  @ApiParam({
    name: 'slug',
    description: 'The unique URL-friendly identifier for the content item',
    type: String,
    example: 'welcome-to-portal',
  })
  @ApiResponse({
    status: 200,
    description: 'Content retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found with the given slug',
  })
  findPublished(@Param('slug') slug: string) {
    return this.contentService.findPublished(slug)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List manageable content items',
    description:
      'Retrieves a paginated list of content items that the authenticated user has permission to manage. Supports filtering by various criteria including status, type, department, and search terms. Returns an array of content items with pagination metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Content list retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findAll(@Req() request: AuthenticatedRequest, @Query() query: ContentListQueryDto) {
    return this.contentService.findAll(query, request.user.sub)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get content by ID',
    description:
      'Retrieves a specific content item by its unique ID. The user must have permission to view the content. Returns the complete content details including all metadata, version history, and related information.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the content item',
    type: String,
    example: 'cm123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Content retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions to view this content',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.findOne(id, request.user.sub)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a content draft',
    description:
      'Creates a new content item in draft status. The content will not be visible to the public until published. The creator is automatically assigned as the owner. Returns the created content item with its generated ID.',
  })
  @ApiBody({
    type: CreateContentDto,
    description: 'Content data including title, body, type, department, and metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'Content draft created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or validation errors',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions to create content',
  })
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateContentDto) {
    return this.contentService.create(body, request.user.sub)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update content and preserve a version snapshot',
    description:
      'Updates an existing content item and automatically creates a version snapshot before applying changes. This allows for rollback to previous versions. The user must have edit permissions for the content.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the content item to update',
    type: String,
    example: 'cm123456789',
  })
  @ApiBody({
    type: UpdateContentDto,
    description: 'Updated content data. Only provided fields will be modified.',
  })
  @ApiResponse({
    status: 200,
    description: 'Content updated successfully with version snapshot created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or validation errors',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions to edit this content',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
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

  @Post(':id/submit-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit content for review' })
  submitForReview(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.submitForReview(id, request.user.sub)
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve content in review' })
  approveContent(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.approveContent(id, request.user.sub)
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject content in review' })
  rejectContent(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.rejectContent(id, request.user.sub)
  }

  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule content for future publication' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scheduledAt: {
          type: 'string',
          format: 'date-time',
          description: 'ISO 8601 datetime string for when to publish',
        },
      },
      required: ['scheduledAt'],
    },
  })
  scheduleContent(
    @Param('id') id: string,
    @Body() body: { scheduledAt: string },
    @Req() request: AuthenticatedRequest
  ) {
    return this.contentService.scheduleContent(id, new Date(body.scheduledAt), request.user.sub)
  }

  @Post(':id/unschedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove scheduled publication' })
  unscheduleContent(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.contentService.unscheduleContent(id, request.user.sub)
  }
}
