import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { HealthModule } from './modules/health/health.module'
import { IamModule } from './modules/iam/iam.module'
import { ContentModule } from './modules/content/content.module'
import { FormsModule } from './modules/forms/forms.module'
import { SearchModule } from './modules/search/search.module'
import { CommunicationModule } from './modules/communication/communication.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    PrismaModule,
    HealthModule,
    IamModule,
    ContentModule,
    FormsModule,
    SearchModule,
    CommunicationModule,
  ],
})
export class AppModule {}
