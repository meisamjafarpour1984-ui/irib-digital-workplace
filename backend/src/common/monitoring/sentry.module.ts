/**
 * IRIB Digital Workplace Platform - Sentry Monitoring Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SentryService } from './sentry.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {}
