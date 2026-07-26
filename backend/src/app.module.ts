import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
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

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Events
    EventEmitterModule.forRoot(),

    // Scheduling
    ScheduleModule.forRoot(),

    // Prisma
    PrismaModule,

    // Bounded Contexts (Modules)
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
  ],
})
export class AppModule {}
