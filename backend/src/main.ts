/**
 * IRIB Digital Workplace Platform - Backend Main Entry Point
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { buildOpenApiDocument } from './common/swagger/openapi'
import { initTracing, shutdownTracing } from './common/tracing/tracing'

async function bootstrap() {
  // ⚠️ OpenTelemetry MUST be initialised BEFORE NestFactory.create()
  // because auto-instrumentations wrap HTTP / Nest modules at require-time.
  await initTracing()

  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  app.use(helmet())
  app.use(cookieParser())

  // Ensure SDK shuts down & flushes spans when Nest signals close
  app.getHttpServer().on('close', () => {
    void shutdownTracing()
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3002')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  const document = buildOpenApiDocument(app)
  SwaggerModule.setup('api/docs', app, document)

  // Start
  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`IRIB DWP Backend running on http://localhost:${port}`)
  console.log(`Swagger docs at http://localhost:${port}/api/docs`)
}

void bootstrap()
