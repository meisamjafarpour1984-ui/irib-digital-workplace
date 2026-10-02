/**
 * IRIB Digital Workplace Platform - Sentry Monitoring Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name)
  private enabled = false

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN')
    const environment = this.configService.get<string>('NODE_ENV', 'development')

    if (!dsn) {
      this.logger.warn('Sentry DSN not configured, monitoring disabled')
      return
    }

    this.enabled = true

    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: this.configService.get<number>('SENTRY_TRACES_SAMPLE_RATE', 0.1),
      profilesSampleRate: this.configService.get<number>('SENTRY_PROFILES_SAMPLE_RATE', 0.1),
      beforeSend(event, _hint) {
        // Filter out sensitive data
        if (event.request) {
          if (event.request.headers) {
            delete event.request.headers['authorization']
            delete event.request.headers['cookie']
          }
        }
        return event
      },
    })

    this.logger.log('Sentry monitoring initialized')
  }

  captureException(exception: unknown, context?: string) {
    if (!this.enabled) return

    Sentry.captureException(exception, {
      tags: { context },
    })
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string) {
    if (!this.enabled) return

    Sentry.captureMessage(message, {
      level,
      tags: { context },
    })
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.enabled) return

    Sentry.setUser(user)
  }

  setTag(key: string, value: string) {
    if (!this.enabled) return

    Sentry.setTag(key, value)
  }

  setContext(key: string, context: Record<string, unknown>) {
    if (!this.enabled) return

    Sentry.setContext(key, context)
  }

  startTransaction(_name: string, _op?: string) {
    if (!this.enabled) return null

    // TODO: Fix Sentry API - startSpan requires 2 arguments
    // return Sentry.startSpan({
    //   name,
    //   op,
    // })
    return null
  }

  addBreadcrumb(breadcrumb: {
    message: string
    category?: string
    level?: 'info' | 'warning' | 'error'
  }) {
    if (!this.enabled) return

    Sentry.addBreadcrumb(breadcrumb)
  }

  async flush(): Promise<void> {
    if (!this.enabled) return

    await Sentry.flush()
  }

  isEnabled(): boolean {
    return this.enabled
  }
}
