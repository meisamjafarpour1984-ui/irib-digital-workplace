<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/app.module.ts
import { Module } from '@nestjs/common'
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
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { IntegrationModule } from './modules/integration/integration.module'
import { PdfGeneratorModule } from './modules/pdf-generator/pdf-generator.module'
import { OutboxModule } from './modules/outbox/outbox.module'
import { CacheModule } from './modules/cache/cache.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

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
    AnalyticsModule,
    IntegrationModule,
    PdfGeneratorModule,
    OutboxModule,
    CacheModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
=======
import { Module } from '@nestjs/common'
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
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { IntegrationModule } from './modules/integration/integration.module'
import { PdfGeneratorModule } from './modules/pdf-generator/pdf-generator.module'
import { OutboxModule } from './modules/outbox/outbox.module'
import { CacheModule } from './modules/cache/cache.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { QueueModule } from './common/queues/queue.module'
import { MultiLevelCacheModule } from './common/cache/multi-level-cache.module'

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
    AnalyticsModule,
    IntegrationModule,
    PdfGeneratorModule,
    OutboxModule,
    CacheModule,
    QueueModule,
    MultiLevelCacheModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/app.module.ts
