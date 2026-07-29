import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async getConnectors() {
    return this.prisma.legacyConnector.findMany({ orderBy: { name: 'asc' } })
  }

  async syncLegacyData(connectorId: string) {
    const connector = await this.prisma.legacyConnector.findUnique({ where: { id: connectorId } })
    if (!connector) throw new Error('Connector not found')
    await this.prisma.legacyConnector.update({
      where: { id: connectorId },
      data: { lastSyncAt: new Date() },
    })
    return { status: 'synced', connector: connector.name }
  }

  async createWebhook(data: { name: string; url: string; events: string[] }) {
    return this.prisma.webhookEndpoint.create({ data })
  }

  async getWebhooks() {
    return this.prisma.webhookEndpoint.findMany({ where: { isActive: true } })
  }

  async deleteWebhook(id: string) {
    return this.prisma.webhookEndpoint.delete({ where: { id } })
  }
}
