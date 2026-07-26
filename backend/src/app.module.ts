import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { HealthModule } from './modules/health/health.module'
import { IamModule } from './modules/iam/iam.module'
import { ContentModule } from './modules/content/content.module'

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
  ],
})
export class AppModule {}
