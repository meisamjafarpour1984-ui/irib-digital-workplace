import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class SmsTemplateService {
  private readonly logger = new Logger(SmsTemplateService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Render template with parameters
   */
  async render(templateCode: string, params: Record<string, any>): Promise<string> {
    const template = await this.prisma.smsTemplate.findUnique({
      where: { code: templateCode, isActive: true },
    })

    if (!template) {
      throw new Error(`Template not found: ${templateCode}`)
    }

    let content = template.content

    // Replace placeholders with values
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`
      content = content.replace(new RegExp(placeholder, 'g'), String(value))
    }

    return content
  }

  /**
   * Create template
   */
  async createTemplate(data: {
    code: string
    name: string
    description?: string
    content: string
    category: string
    providerPatternId?: string
    parameters?: string[]
  }) {
    return this.prisma.smsTemplate.create({
      data,
    })
  }

  /**
   * Get all templates
   */
  async getTemplates(category?: string) {
    return this.prisma.smsTemplate.findMany({
      where: category ? { category, isActive: true } : { isActive: true },
      orderBy: { code: 'asc' },
    })
  }

  /**
   * Get template by code
   */
  async getTemplate(code: string) {
    return this.prisma.smsTemplate.findUnique({
      where: { code },
    })
  }

  /**
   * Update template
   */
  async updateTemplate(
    code: string,
    data: {
      name?: string
      description?: string
      content?: string
      category?: string
      providerPatternId?: string
      parameters?: string[]
      isActive?: boolean
    }
  ) {
    return this.prisma.smsTemplate.update({
      where: { code },
      data,
    })
  }

  /**
   * Delete template
   */
  async deleteTemplate(code: string) {
    return this.prisma.smsTemplate.delete({
      where: { code },
    })
  }
}
