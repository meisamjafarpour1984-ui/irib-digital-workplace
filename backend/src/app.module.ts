/**
 * IRIB Digital Workplace Platform - Backend Application Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { HealthModule } from './modules/health/health.module'
import { IamModule } from './modules/iam/iam.module'
import { AccessControlModule } from './modules/access-control/access-control.module'
import { OrganizationModule } from './modules/organization/organization.module'
import { ContentModule } from './modules/content/content.module'
import { MediaModule } from './modules/media/media.module'
import { WidgetEngineModule } from './modules/widget-engine/widget-engine.module'
import { FormsModule } from './modules/forms/forms.module'
import { KnowledgeModule } from './modules/knowledge/knowledge.module'
import { SoftwareModule } from './modules/software/software.module'
import { SearchModule } from './modules/search/search.module'
import { CommunicationModule } from './modules/communication/communication.module'
import { MobileIdentityModule } from './modules/mobile-identity/mobile-identity.module'
import { MobileVerificationModule } from './modules/mobile-verification/mobile-verification.module'
import { NotificationModule } from './modules/notification/notification.module'
import { SmsModule } from './modules/sms/sms.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { IntegrationModule } from './modules/integration/integration.module'
import { PdfGeneratorModule } from './modules/pdf-generator/pdf-generator.module'
import { OutboxModule } from './modules/outbox/outbox.module'
import { CacheModule } from './common/cache/cache.module'
import { TicketsModule } from './modules/tickets/tickets.module'
import { SystemSettingsModule } from './modules/system-settings/system-settings.module'
import { WizardModule } from './devtools/wizard/wizard.module'
import { StorageModule } from './modules/storage/storage.module'
import { ThemeModule } from './modules/theme/theme.module'
import { AuditModule } from './modules/audit/audit.module'
import { WebsocketModule } from './modules/websocket/websocket.module'
import { AnalyticsDashboardModule } from './modules/analytics-dashboard/analytics-dashboard.module'
import { PageBuilderModule } from './modules/page-builder/page-builder.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { QueueModule } from './common/queues/queue.module'
import { SentryModule } from './common/monitoring/sentry.module'
import { QueryTimeoutMiddleware } from './common/middleware/query-timeout.middleware'

const enableDevelopmentWizard =
  process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_WIZARD !== 'false'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
    HealthModule,
    IamModule,
    AccessControlModule,
    OrganizationModule,
    ContentModule,
    MediaModule,
    WidgetEngineModule,
    FormsModule,
    KnowledgeModule,
    SoftwareModule,
    SearchModule,
    CommunicationModule,
    MobileIdentityModule,
    MobileVerificationModule,
    NotificationModule,
    SmsModule,
    AnalyticsModule,
    IntegrationModule,
    PdfGeneratorModule,
    OutboxModule,
    CacheModule,
    QueueModule,
    TicketsModule,
    SystemSettingsModule,
    StorageModule,
    ThemeModule,
    AuditModule,
    WebsocketModule,
    AnalyticsDashboardModule,
    PageBuilderModule,
    SentryModule,
    ...(enableDevelopmentWizard ? [WizardModule] : []),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(QueryTimeoutMiddleware).forRoutes('*')
  }
}
