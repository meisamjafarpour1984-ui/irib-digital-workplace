import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  app.use(helmet())

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('IRIB DWP API')
    .setDescription('IRIB East Azerbaijan Digital Workplace Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('IAM', 'Identity & Access Management')
    .addTag('Content', 'Content Management System')
    .addTag('Widgets', 'Widget Engine & Page Layouts')
    .addTag('Forms', 'Forms & Workflow Engine')
    .addTag('Communication', 'Smart Communication Workspace')
    .addTag('Media', 'Media & Storage')
    .addTag('Knowledge', 'Experts & Legends')
    .addTag('Software', 'Software Center & IT Support')
    .addTag('Analytics', 'Analytics & Reports')
    .addTag('Admin', 'Administration')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  // Start
  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`IRIB DWP Backend running on http://localhost:${port}`)
  console.log(`Swagger docs at http://localhost:${port}/api/docs`)
}

void bootstrap()
