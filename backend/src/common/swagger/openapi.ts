import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function buildOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('IRIB DWP API')
    .setDescription('IRIB East Azerbaijan Digital Workplace Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('IAM', 'Identity & Access Management')
    .addTag('Access Control', 'Roles & Permissions')
    .addTag('Organization', 'Org structure & microsites')
    .addTag('Content', 'Content Management System')
    .addTag('Widget Engine', 'Widget Engine & Page Layouts')
    .addTag('Forms', 'Forms & Workflow Engine')
    .addTag('Communication', 'Smart Communication Workspace')
    .addTag('Media', 'Media & Storage')
    .addTag('Knowledge', 'Experts & Legends')
    .addTag('Software', 'Software Center & IT Support')
    .addTag('Search', 'Unified search')
    .addTag('Mobile Identity', 'Mobile OTP & QR linking')
    .addTag('Analytics', 'Analytics & Reports')
    .addTag('Integration', 'Legacy connectors & webhooks')
    .addTag('User Management', 'Administration')
    .build()

  return SwaggerModule.createDocument(app, config)
}
