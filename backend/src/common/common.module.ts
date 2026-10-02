/**
 * IRIB Digital Workplace Platform - Common Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module } from '@nestjs/common'
import { PermissionsGuard } from './guards/permissions.guard'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { CacheInterceptor } from './cache/cache.interceptor'
import { PermissionService } from './services/permission.service'
import { EmailService } from './services/email.service'
import { PushNotificationService } from './services/push-notification.service'
import { PermissionsController } from './controllers/permissions.controller'
import {
  PERMISSION_KEY,
  RequirePermission,
  REQUIRE_SCOPE_KEY,
  RequireScope,
} from './guards/permissions.guard'
import { CacheModule } from './cache/cache.module'

@Module({
  imports: [CacheModule],
  providers: [
    PermissionsGuard,
    AllExceptionsFilter,
    CacheInterceptor,
    PermissionService,
    EmailService,
    PushNotificationService,
  ],
  controllers: [PermissionsController],
  exports: [
    PermissionsGuard,
    AllExceptionsFilter,
    CacheInterceptor,
    PermissionService,
    EmailService,
    PushNotificationService,
  ],
})
export class CommonModule {
  static get PERMISSION_KEY() {
    return PERMISSION_KEY
  }

  static get RequirePermission() {
    return RequirePermission
  }

  static get REQUIRE_SCOPE_KEY() {
    return REQUIRE_SCOPE_KEY
  }

  static get RequireScope() {
    return RequireScope
  }
}
