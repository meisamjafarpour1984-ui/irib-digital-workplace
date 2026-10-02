import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { PdfGeneratorService } from './pdf-generator.service'
import { GeneratePdfDto } from './dto/pdf-generator.dto'

@Controller('pdf')
export class PdfGeneratorController {
  constructor(private readonly pdfGeneratorService: PdfGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generatePdf(@Body() generatePdfDto: GeneratePdfDto) {
    return this.pdfGeneratorService.generatePdf(generatePdfDto)
  }

  @Post('generate-from-url')
  @HttpCode(HttpStatus.OK)
  async generateFromUrl(@Body() body: { url: string; options?: any }) {
    return this.pdfGeneratorService.generateFromUrl(body.url, body.options)
  }

  @Post('generate-from-html')
  @HttpCode(HttpStatus.OK)
  async generateFromHtml(@Body() body: { html: string; options?: any }) {
    return this.pdfGeneratorService.generateFromHtml(body.html, body.options)
  }
}
