import { Module } from '@nestjs/common'
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
  ],
})
export class AppModule {}
