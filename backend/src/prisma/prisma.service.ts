<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import {
  softDeleteMiddleware,
  loggingMiddleware,
  cacheInvalidationMiddleware,
} from './prisma.middleware'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
    
    // Register middleware
    this.$use(softDeleteMiddleware)
    this.$use(loggingMiddleware)
    this.$use(cacheInvalidationMiddleware)
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
=======
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import {
  softDeleteMiddleware,
  loggingMiddleware,
  cacheInvalidationMiddleware,
} from './prisma.middleware.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
    
    // Register middleware
    this.$use(softDeleteMiddleware)
    this.$use(loggingMiddleware)
    this.$use(cacheInvalidationMiddleware)
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/prisma/prisma.service.ts
