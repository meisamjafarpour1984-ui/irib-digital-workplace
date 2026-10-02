/**
 * IRIB Digital Workplace Platform - Tickets Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { TicketsRepository } from './tickets.repository'

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository],
  exports: [TicketsService],
})
export class TicketsModule {}
