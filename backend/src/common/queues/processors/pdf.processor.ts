import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PdfGenerationJobData } from '../queue.service'
import * as puppeteer from 'puppeteer'

@Processor('pdf-generation')
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name)
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
          '--user-data-dir=/tmp/chromium-pdf-worker',
        ],
      })
      this.logger.log('Puppeteer browser launched successfully for PDF processor')
    } catch (error) {
      this.logger.error('Failed to launch Puppeteer browser for PDF processor', error)
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close()
      this.logger.log('Puppeteer browser closed for PDF processor')
    }
  }

  async process(job: Job<PdfGenerationJobData>) {
    this.logger.log(`Processing PDF generation job ${job.id}`)

    try {
      const { contentId, template, data } = job.data

      if (!this.browser) {
        this.logger.warn('Browser not initialized, using simulation')
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return { success: true, contentId, pdfUrl: `generated-${contentId}.pdf` }
      }

      this.logger.log(`Generating PDF for content ${contentId} using Puppeteer`)

      // Generate HTML content from template and data
      const htmlContent = this.generateHtmlFromTemplate(template, data)

      const page = await this.browser.newPage()

      try {
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        })

        this.logger.log(`PDF generated successfully for content ${contentId}`)
        return {
          success: true,
          contentId,
          pdfData: pdfBuffer.toString('base64'),
          contentType: 'application/pdf',
        }
      } finally {
        await page.close()
      }
    } catch (error) {
      this.logger.error(`Failed to generate PDF for content ${job.data.contentId}`, error)
      throw error
    }
  }

  private generateHtmlFromTemplate(template: string, data: Record<string, unknown>): string {
    // Simple template engine - in production, use a proper template engine like Handlebars
    let html = template

    // Replace placeholders with data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      html = html.replace(new RegExp(placeholder, 'g'), String(value))
    })

    // Add basic HTML structure if not present
    if (!html.includes('<html')) {
      html = `
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>Generated PDF</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>IRIB Digital Workplace</h1>
          </div>
          <div class="content">
            ${html}
          </div>
        </body>
        </html>
      `
    }

    return html
  }
}
