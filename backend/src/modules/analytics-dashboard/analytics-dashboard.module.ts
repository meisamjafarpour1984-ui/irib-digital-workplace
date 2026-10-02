/**
 * IRIB Digital Workplace Platform - Analytics Dashboard Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { AnalyticsDashboardController } from './analytics-dashboard.controller'
import { AnalyticsDashboardService } from './analytics-dashboard.service'

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsDashboardController],
  providers: [AnalyticsDashboardService],
  exports: [AnalyticsDashboardService],
})
export class AnalyticsDashboardModule {}
