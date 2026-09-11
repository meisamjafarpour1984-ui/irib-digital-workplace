import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SmsRepository } from './sms.repository'
// import { SmsTemplateService } from './sms-template.service'
// import { SmsQueueService } from './sms-queue.service'
// import { DeliveryTrackingService } from './delivery-tracking.service'
import { IdehPayamAdapter } from './adapters/idehpayam.adapter'
import { MockSmsAdapter } from './adapters/mock-sms.adapter'

export interface SmsSendResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)
  private readonly useMockAdapter: boolean

  constructor(
    private config: ConfigService,
    private repository: SmsRepository,
    // private templateService: SmsTemplateService,
    // private queueService: SmsQueueService,
    // private trackingService: DeliveryTrackingService,
    private idehPayamAdapter: IdehPayamAdapter,
    private mockSmsAdapter: MockSmsAdapter
  ) {
    this.useMockAdapter = this.config.get<string>('SMS_ADAPTER', 'mock') === 'mock'
  }

  /**
   * Send single SMS
   */
  async send(
    recipient: string,
    message: string,
    options?: { templateCode?: string; params?: Record<string, any> }
  ): Promise<SmsSendResult> {
    try {
      // Get active provider config
      const providerConfig = await this.repository.getActiveProvider()
      if (!providerConfig) {
        return { success: false, error: 'No active SMS provider configured' }
      }

      // Use template if provided (disabled - service not available)
      const content = message
      // if (options?.templateCode) {
      //   const template = await this.templateService.render(options.templateCode, options.params || {})
      //   content = template
      //   For now, just use the provided message
      // }

      // Send via appropriate adapter
      const adapter = this.useMockAdapter ? this.mockSmsAdapter : this.idehPayamAdapter
      const result = await adapter.send(recipient, content, providerConfig)

      // Log message to database
      await this.repository.createMessage({
        providerConfigId: providerConfig.id,
        recipient,
        content,
        status: result.success ? 'SENT' : 'FAILED',
        providerMessageId: result.messageId,
        error: 'error' in result ? result.error : null,
        cost: 'cost' in result ? result.cost : null,
        sentAt: new Date(),
      })

      return result
    } catch (error) {
      this.logger.error('Error sending SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send bulk SMS (queued - disabled)
   */
  async sendBulk(
    recipients: string[],
    message: string,
    options?: { templateCode?: string; params?: Record<string, any> }
  ) {
    // return this.queueService.enqueueBulk(recipients, message, options)
    return { success: false, error: 'Bulk SMS not available - queue service disabled' }
  }

  /**
   * Send SMS using template
   */
  async sendTemplate(
    recipient: string,
    templateCode: string,
    params: Record<string, any>
  ): Promise<SmsSendResult> {
    return this.send(recipient, '', { templateCode, params })
  }

  /**
   * Get provider status
   */
  async getProviderStatus() {
    const providerConfig = await this.repository.getActiveProvider()
    if (!providerConfig) {
      return { connected: false, provider: null }
    }

    const credit = await this.idehPayamAdapter.getCredit(providerConfig)

    return {
      connected: true,
      provider: providerConfig.name,
      credit,
      lastChecked: providerConfig.updatedAt,
    }
  }

  /**
   * Update provider credit
   */
  async updateCredit() {
    const providerConfig = await this.repository.getActiveProvider()
    if (!providerConfig) {
      throw new Error('No active SMS provider configured')
    }

    const credit = await this.idehPayamAdapter.getCredit(providerConfig)
    await this.repository.updateProviderCredit(providerConfig.id, credit)

    return { credit }
  }
}
