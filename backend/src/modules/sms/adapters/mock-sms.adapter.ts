/**
 * IRIB Digital Workplace Platform - Mock SMS Adapter
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MockSmsAdapter {
  private readonly logger = new Logger(MockSmsAdapter.name)
  private readonly sentMessages: Map<string, any> = new Map()

  /**
   * Send SMS (mock implementation)
   */
  async sendSms(recipient: string, message: string, config: any) {
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.logger.log(`[MOCK SMS] Sending to: ${recipient}`)
    this.logger.log(`[MOCK SMS] Message: ${message}`)
    this.logger.log(`[MOCK SMS] Message ID: ${messageId}`)

    // Store message for tracking
    this.sentMessages.set(messageId, {
      recipient,
      message,
      config,
      sentAt: new Date(),
      status: 'SENT',
    })

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      success: true,
      messageId,
      recipient,
      status: 'SENT',
    }
  }

  /**
   * Send SMS (alias for sendSms for compatibility)
   */
  async send(recipient: string, message: string, _config: any) {
    return this.sendSms(recipient, message, _config)
  }

  /**
   * Get delivery status (mock implementation)
   */
  async getStatus(messageId: string, _config: any) {
    const message = this.sentMessages.get(messageId)

    if (!message) {
      this.logger.warn(`[MOCK SMS] Message ${messageId} not found`)
      return 'NOT_FOUND'
    }

    // Simulate delivery after 5 seconds
    const elapsed = Date.now() - message.sentAt.getTime()
    if (elapsed > 5000) {
      message.status = 'DELIVERED'
      this.sentMessages.set(messageId, message)
      return 'DELIVERED'
    }

    return message.status
  }

  /**
   * Get balance (mock implementation)
   */
  async getBalance(_config: any) {
    this.logger.log(`[MOCK SMS] Checking balance`)
    return 10000 // Mock balance: 10,000 credits
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string) {
    return this.sentMessages.get(messageId)
  }

  /**
   * Get all sent messages
   */
  getAllMessages() {
    return Array.from(this.sentMessages.values())
  }

  /**
   * Clear all messages (for testing)
   */
  clearMessages() {
    this.sentMessages.clear()
    this.logger.log('[MOCK SMS] Cleared all messages')
  }
}
