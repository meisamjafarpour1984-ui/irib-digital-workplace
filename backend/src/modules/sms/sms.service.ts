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
    _options?: { templateCode?: string; params?: Record<string, any> }
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
      const normalizedProviderConfig = {
        ...providerConfig,
        apiUrl: providerConfig.apiUrl ?? 'https://87.248.137.76/api/v1/rest',
      }
      const result = await adapter.send(recipient, content, normalizedProviderConfig)

      // Log message to database
      await this.repository.createMessage({
        providerConfigId: providerConfig.id,
        recipient,
        content,
        status: result.success ? 'SENT' : 'FAILED',
        providerMessageId: result.messageId,
        error: 'error' in result ? result.error : undefined,
        cost: 'cost' in result ? result.cost : undefined,
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
    _recipients: string[],
    _message: string,
    _options?: { templateCode?: string; params?: Record<string, any> }
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

    const normalizedProviderConfig = {
      ...providerConfig,
      apiUrl: providerConfig.apiUrl ?? 'https://87.248.137.76/api/v1/rest',
    }
    const credit = await this.idehPayamAdapter.getCredit(normalizedProviderConfig)

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

    const normalizedProviderConfig = {
      ...providerConfig,
      apiUrl: providerConfig.apiUrl ?? 'https://87.248.137.76/api/v1/rest',
    }
    const credit = await this.idehPayamAdapter.getCredit(normalizedProviderConfig)
    await this.repository.updateProviderCredit(providerConfig.id, credit)

    return { credit }
  }
}
