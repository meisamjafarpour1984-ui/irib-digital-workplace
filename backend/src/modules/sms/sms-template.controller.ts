import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SmsTemplateService } from './sms-template.service'

@ApiTags('SMS Templates')
@Controller('sms/templates')
export class SmsTemplateController {
  constructor(private readonly templateService: SmsTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create SMS template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async createTemplate(@Body() body: any) {
    return this.templateService.createTemplate(body)
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getTemplates(@Query('category') category?: string) {
    return this.templateService.getTemplates(category)
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get template by code' })
  @ApiResponse({ status: 200, description: 'Template retrieved' })
  async getTemplate(@Param('code') code: string) {
    return this.templateService.getTemplate(code)
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  async updateTemplate(@Param('code') code: string, @Body() body: any) {
    return this.templateService.updateTemplate(code, body)
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async deleteTemplate(@Param('code') code: string) {
    return this.templateService.deleteTemplate(code)
  }

  @Post('render')
  @ApiOperation({ summary: 'Render template with parameters' })
  @ApiResponse({ status: 200, description: 'Template rendered' })
  async renderTemplate(@Body() body: { templateCode: string; params: Record<string, any> }) {
    const content = await this.templateService.render(body.templateCode, body.params)
    return { content }
  }
}
