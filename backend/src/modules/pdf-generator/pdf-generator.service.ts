import { Injectable, Logger } from '@nestjs/common'
import * as puppeteer from 'puppeteer'

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name)
  private browser: puppeteer.Browser | null = null

  async onModuleInit() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--disable-gpu',
          '--disable-crash-reporter',
          '--disable-breakpad',
          '--disable-features=Crashpad',
          '--user-data-dir=/tmp/chromium-pdf',
        ],
      })
      this.logger.log('Puppeteer browser launched successfully')
    } catch (error) {
      this.logger.error('Failed to launch Puppeteer browser', error)
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close()
      this.logger.log('Puppeteer browser closed')
    }
  }

  async generatePdf(generatePdfDto: {
    content: string
    format?: string
    orientation?: string
    options?: Record<string, unknown>
  }) {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage()

    try {
      const format = generatePdfDto.format || 'A4'
      const orientation = generatePdfDto.orientation || 'PORTRAIT'

      await page.setContent(generatePdfDto.content, {
        waitUntil: 'networkidle0',
      })

      const pdfBuffer = await page.pdf({
        format: format.toLowerCase() as any,
        landscape: orientation === 'LANDSCAPE',
        ...generatePdfDto.options,
      })

      await page.close()

      return {
        success: true,
        data: pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      }
    } catch (error) {
      this.logger.error('Failed to generate PDF', error)
      await page.close()
      throw error
    }
  }

  async generateFromUrl(url: string, options?: any) {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        ...options,
      })

      await page.close()

      return {
        success: true,
        data: pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      }
    } catch (error) {
      this.logger.error('Failed to generate PDF from URL', error)
      await page.close()
      throw error
    }
  }

  async generateFromHtml(html: string, options?: any) {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage()

    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        ...options,
      })

      await page.close()

      return {
        success: true,
        data: pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      }
    } catch (error) {
      this.logger.error('Failed to generate PDF from HTML', error)
      await page.close()
      throw error
    }
  }
}
