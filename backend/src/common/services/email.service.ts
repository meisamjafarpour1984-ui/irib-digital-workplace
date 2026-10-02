/**
 * IRIB Digital Workplace Platform - Email Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'

type EmailTransporter = Transporter & {
  verify?: () => Promise<void>
}

export interface EmailOptions {
  to: string | string[]
  subject?: string // Optional when using template
  text?: string
  html?: string
  template?: string
  templateData?: Record<string, unknown>
  attachments?: Array<{
    filename: string
    path?: string
    content?: Buffer
    contentType?: string
  }>
}

export interface EmailTemplate {
  name: string
  subject: string
  html: string
  text?: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter!: EmailTransporter
  private fromAddress = ''
  private fromName = ''

  constructor(private readonly config: ConfigService) {
    this.initializeTransporter()
  }

  /**
   * Initialize email transporter based on configuration
   */
  private initializeTransporter(): void {
    const emailConfig = {
      host: this.config.get('EMAIL_HOST') || 'localhost',
      port: this.config.get('EMAIL_PORT') || 587,
      secure: this.config.get('EMAIL_SECURE') === 'true',
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    }

    this.fromAddress = this.config.get('EMAIL_FROM') || 'noreply@iribtabriz.ir'
    this.fromName = this.config.get('EMAIL_FROM_NAME') || 'IRIB Digital Workplace'

    // If no SMTP credentials are provided, use a test account (Ethereal)
    if (!emailConfig.auth.user) {
      this.logger.warn('No SMTP credentials provided, using test account')
      // In production, this should throw an error or use a real SMTP service
      emailConfig.auth = {
        user: 'test@example.com',
        pass: 'test',
      }
    }

    this.transporter = createTransport(emailConfig)
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      }

      // If template is provided, render it
      if (options.template) {
        const rendered = await this.renderTemplate(options.template, options.templateData)
        mailOptions.html = rendered.html
        mailOptions.text = rendered.text || mailOptions.text
        mailOptions.subject = options.subject || rendered.subject
      }

      const info = await this.transporter.sendMail(mailOptions)
      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`)
      return true
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error)
      return false
    }
  }

  /**
   * Send email to multiple recipients
   */
  async sendBulkEmail(options: EmailOptions): Promise<{ success: string[]; failed: string[] }> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to]
    const results = { success: [] as string[], failed: [] as string[] }

    for (const recipient of recipients) {
      const success = await this.sendEmail({ ...options, to: recipient })
      if (success) {
        results.success.push(recipient)
      } else {
        results.failed.push(recipient)
      }
    }

    return results
  }

  /**
   * Render an email template
   * In a real implementation, this would use a template engine like Handlebars, EJS, or Pug
   */
  private async renderTemplate(
    templateName: string,
    data: Record<string, unknown>
  ): Promise<{ html: string; text?: string; subject?: string }> {
    // Simple template rendering - in production, use a proper template engine
    const templates: Record<string, EmailTemplate> = {
      'otp-login': {
        name: 'otp-login',
        subject: 'کد ورود به درگاه دیجیتال',
        html: `
          <div dir="rtl" style="font-family: Vazirmatn, sans-serif;">
            <h2>کد ورود یکبار مصرف</h2>
            <p>سلام،</p>
            <p>کد ورود شما به درگاه دیجیتال صدا و سیمای آذربایجان شرقی:</p>
            <h1 style="color: #00A6B6; font-size: 32px; margin: 20px 0;">{{code}}</h1>
            <p>این کد فقط ۵ دقیقه معتبر است.</p>
            <p>اگر شما درخواستی نداده‌اید، این پیام را نادیده بگیرید.</p>
            <p>با احترام،<br>وحد فناوری اطلاعات صدا و سیمای آذربایجان شرقی</p>
          </div>
        `,
      },
      'password-reset': {
        name: 'password-reset',
        subject: 'بازنشانی رمز عبور',
        html: `
          <div dir="rtl" style="font-family: Vazirmatn, sans-serif;">
            <h2>بازنشانی رمز عبور</h2>
            <p>سلام،</p>
            <p>برای بازنشانی رمز عبور خود روی لینک زیر کلیک کنید:</p>
            <a href="{{resetLink}}" style="background-color: #00A6B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">بازنشانی رمز عبور</a>
            <p style="margin-top: 20px;">این لینک فقط ۱ ساعت معتبر است.</p>
            <p>اگر شما درخواستی نداده‌اید، این پیام را نادیده بگیرید.</p>
          </div>
        `,
      },
      'task-assigned': {
        name: 'task-assigned',
        subject: 'تکلیف جدید به شما واگذار شد',
        html: `
          <div dir="rtl" style="font-family: Vazirmatn, sans-serif;">
            <h2>تکلیف جدید</h2>
            <p>سلام،</p>
            <p>یک تکلیف جدید به شما واگذار شده است:</p>
            <h3>{{taskTitle}}</h3>
            <p>{{taskDescription}}</p>
            <p>اولویت: {{priority}}</p>
            <p>مهلت: {{dueDate}}</p>
            <a href="{{taskLink}}" style="background-color: #00A6B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">مشاهده تکلیف</a>
          </div>
        `,
      },
      'system-alert': {
        name: 'system-alert',
        subject: 'هشدار سیستم',
        html: `
          <div dir="rtl" style="font-family: Vazirmatn, sans-serif;">
            <h2>هشدار سیستم</h2>
            <p>سلام،</p>
            <p>{{alertMessage}}</p>
            <p>زمان: {{timestamp}}</p>
            <p>لطفاً به درگاه دیجیتال مراجعه کنید برای اطلاعات بیشتر.</p>
          </div>
        `,
      },
    }

    const template = templates[templateName]
    if (!template) {
      throw new Error(`Template ${templateName} not found`)
    }

    // Simple variable replacement
    let html = template.html
    let text = template.text
    let subject = template.subject

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`
      html = html.replace(new RegExp(placeholder, 'g'), String(value))
      if (text) text = text.replace(new RegExp(placeholder, 'g'), String(value))
      if (subject) subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
    }

    return { html, text, subject }
  }

  /**
   * Send OTP email
   */
  async sendOtpEmail(to: string, code: string): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'otp-login',
      templateData: { code },
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'password-reset',
      templateData: { resetLink },
    })
  }

  /**
   * Send task assignment email
   */
  async sendTaskAssignmentEmail(
    to: string,
    taskTitle: string,
    taskDescription: string,
    priority: string,
    dueDate: string,
    taskLink: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'task-assigned',
      templateData: {
        taskTitle,
        taskDescription,
        priority,
        dueDate,
        taskLink,
      },
    })
  }

  /**
   * Send system alert email
   */
  async sendSystemAlertEmail(
    to: string,
    alertMessage: string,
    timestamp: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'system-alert',
      templateData: { alertMessage, timestamp },
    })
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const verify = this.transporter.verify ?? (() => Promise.resolve())
      await verify()
      this.logger.log('Email connection verified successfully')
      return true
    } catch (error) {
      this.logger.error('Email connection verification failed:', error)
      return false
    }
  }
}
