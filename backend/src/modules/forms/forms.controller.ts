import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { CreateFormDto, SubmissionListQueryDto, SubmitFormDto } from './dto/forms.dto'
import { FormsService } from './forms.service'

type AuthenticatedRequest = Request & { user: { sub: string } }

@ApiTags('Forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  @Get('public/:slug')
  @ApiOperation({ summary: 'Get an active form definition' })
  getActive(@Param('slug') slug: string) {
    return this.forms.getActive(slug)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  list(@Req() request: AuthenticatedRequest) {
    return this.forms.list(request.user.sub)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateFormDto) {
    return this.forms.create(body, request.user.sub)
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  activate(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.forms.activate(id, request.user.sub)
  }

  @Post(':slug/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  submit(
    @Param('slug') slug: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SubmitFormDto
  ) {
    return this.forms.submit(slug, body.data, request.user.sub)
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  listSubmissions(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Query() query: SubmissionListQueryDto
  ) {
    return this.forms.listSubmissions(id, request.user.sub, query)
  }
}
