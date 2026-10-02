/**
 * IRIB Digital Workplace Platform - Page Builder Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { PageBuilderController } from './page-builder.controller'
import { PageBuilderService } from './page-builder.service'

@Module({
  imports: [PrismaModule],
  controllers: [PageBuilderController],
  providers: [PageBuilderService],
  exports: [PageBuilderService],
})
export class PageBuilderModule {}
