/**
 * IRIB Digital Workplace Platform - IdehPayam SMS Adapter
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

export interface IdehPayamConfig {
  apiUrl: string
  apiToken: string
  senderNumber?: string | null
}

export interface SmsSendResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
}

/**
 * IdehPayam SMS Provider Adapter
 * REST API integration for IdehPayam SMS gateway
 *
 * Documentation reference:
 * - API Endpoint (HTTPS REST): https://87.248.137.76/api/v1/rest
 * - Authentication: Token-based (API Token in header or query param)
 * - Methods: SendSms, SendBulkSms, GetStatus, GetUserCredit, SendSmsByPattern
 * - Max recipients: 400 per request
 * - Rate limit: 200-300 requests per minute
 * - Delivery report retention: 1 month
 *
 * REST API Endpoints:
 * - POST /send-sms - Send single SMS
 * - POST /send-bulk-sms - Send bulk SMS
 * - GET /status/:messageId - Get delivery status
 * - GET /credit - Get user credit balance
 * - POST /send-pattern-sms - Send SMS using pattern
 */
@Injectable()
export class IdehPayamAdapter {
  private readonly logger = new Logger(IdehPayamAdapter.name)
  private readonly axiosInstance: AxiosInstance

  constructor(private config: ConfigService) {
    this.axiosInstance = axios.create({
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  /**
   * Send single SMS via IdehPayam REST API
   */
  async send(
    recipient: string,
    message: string,
    providerConfig: IdehPayamConfig
  ): Promise<SmsSendResult> {
    try {
      this.logger.debug(`Sending SMS to ${recipient} via IdehPayam REST API`)

      const apiUrl = providerConfig.apiUrl || 'https://87.248.137.76/api/v1/rest'
      const sender = providerConfig.senderNumber || '30005006007600'

      const payload = {
        token: providerConfig.apiToken,
        sender,
        receptor: recipient,
        message,
      }

      const response = await this.axiosInstance.post(`${apiUrl}/send-sms`, payload)

      if (response.data && response.data.status === 200) {
        return {
          success: true,
          messageId: response.data.message_id || response.data.id,
          cost: response.data.cost || 0,
        }
      } else {
        return {
          success: false,
          error: response.data?.message || 'Unknown error from IdehPayam',
        }
      }
    } catch (error) {
      this.logger.error('IdehPayam REST API error:', error)
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Network error',
        }
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send bulk SMS via IdehPayam REST API
   */
  async sendBulk(
    recipients: string[],
    message: string,
    providerConfig: IdehPayamConfig
  ): Promise<SmsSendResult[]> {
    try {
      this.logger.debug(
        `Sending bulk SMS to ${recipients.length} recipients via IdehPayam REST API`
      )

      const apiUrl = providerConfig.apiUrl || 'https://87.248.137.76/api/v1/rest'
      const sender = providerConfig.senderNumber || '30005006007600'

      // IdehPayam supports up to 400 recipients per request
      const batchSize = 400
      const batches: string[][] = []

      for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize))
      }

      const allResults: SmsSendResult[] = []

      for (const batch of batches) {
        const payload = {
          token: providerConfig.apiToken,
          sender,
          receptor: batch.join(','),
          message,
        }

        const response = await this.axiosInstance.post(`${apiUrl}/send-bulk-sms`, payload)

        if (response.data && response.data.status === 200) {
          // IdehPayam returns bulk results
          const messageIds = response.data.message_ids || []
          for (let i = 0; i < batch.length; i++) {
            allResults.push({
              success: true,
              messageId: messageIds[i] || `bulk-${Date.now()}-${i}`,
              cost: response.data.cost_per_sms || 0,
            })
          }
        } else {
          // If bulk fails, mark all as failed
          batch.forEach(() => {
            allResults.push({
              success: false,
              error: response.data?.message || 'Bulk send failed',
            })
          })
        }
      }

      return allResults
    } catch (error) {
      this.logger.error('IdehPayam bulk REST API error:', error)
      return recipients.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }))
    }
  }

  /**
   * Get SMS delivery status
   */
  async getStatus(messageId: string, providerConfig: IdehPayamConfig): Promise<string> {
    try {
      this.logger.debug(`Getting status for message ${messageId}`)

      const apiUrl = providerConfig.apiUrl || 'https://87.248.137.76/api/v1/rest'

      const response = await this.axiosInstance.get(`${apiUrl}/status/${messageId}`, {
        params: {
          token: providerConfig.apiToken,
        },
      })

      if (response.data && response.data.status !== undefined) {
        return this.mapStatusToInternal(response.data.status)
      }

      return 'UNKNOWN'
    } catch (error) {
      this.logger.error('Error getting status:', error)
      return 'UNKNOWN'
    }
  }

  /**
   * Map IdehPayam status code to internal status
   *
   * IdehPayam Status Codes:
   * 0: Sent to operator (no report) -> SENT
   * 1: Sent to operator -> SENT
   * 2: Not reached operator -> FAILED
   * 3: No recipient entered -> FAILED
   * 4: Delivered to phone -> DELIVERED
   * 5: Not delivered to phone -> FAILED
   * 6: Returned -> FAILED
   * 60: Time limit for public lines -> FAILED
   * 66: Unknown error -> FAILED
   * 61: Array count > 20 -> FAILED
   */
  private mapStatusToInternal(statusCode: number): string {
    const statusMap: Record<number, string> = {
      0: 'SENT',
      1: 'SENT',
      2: 'FAILED',
      3: 'FAILED',
      4: 'DELIVERED',
      5: 'FAILED',
      6: 'FAILED',
      60: 'FAILED',
      66: 'FAILED',
      61: 'FAILED',
    }
    return statusMap[statusCode] || 'UNKNOWN'
  }

  /**
   * Get user credit balance
   */
  async getCredit(providerConfig: IdehPayamConfig): Promise<number> {
    try {
      this.logger.debug('Getting credit balance from IdehPayam REST API')

      const apiUrl = providerConfig.apiUrl || 'https://87.248.137.76/api/v1/rest'

      const response = await this.axiosInstance.get(`${apiUrl}/credit`, {
        params: {
          token: providerConfig.apiToken,
        },
      })

      if (response.data && response.data.credit !== undefined) {
        return parseFloat(response.data.credit)
      }

      return 0
    } catch (error) {
      this.logger.error('Error getting credit:', error)
      return 0
    }
  }

  /**
   * Send SMS using pattern (template)
   */
  async sendPattern(
    recipient: string,
    patternId: string,
    params: Record<string, string>,
    providerConfig: IdehPayamConfig
  ): Promise<SmsSendResult> {
    try {
      this.logger.debug(`Sending pattern SMS ${patternId} to ${recipient}`)

      const apiUrl = providerConfig.apiUrl || 'https://87.248.137.76/api/v1/rest'
      const sender = providerConfig.senderNumber || '30005006007600'

      const payload = {
        token: providerConfig.apiToken,
        sender,
        receptor: recipient,
        pattern: patternId,
        ...params,
      }

      const response = await this.axiosInstance.post(`${apiUrl}/send-pattern-sms`, payload)

      if (response.data && response.data.status === 200) {
        return {
          success: true,
          messageId: response.data.message_id || `pattern-${Date.now()}`,
          cost: response.data.cost || 0,
        }
      } else {
        return {
          success: false,
          error: response.data?.message || 'Pattern send failed',
        }
      }
    } catch (error) {
      this.logger.error('Error sending pattern SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }
}
