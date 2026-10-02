import { Controller, Get, Header, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MetricsService } from './metrics.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisCacheService } from '../../common/cache/redis-cache.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisCacheService
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Process liveness probe' })
  live() {
    return {
      status: 'ok',
      service: 'irib-dwp-backend',
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Process readiness probe' })
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`
    const redisReady = await this.redis.ping()

    if (!redisReady) {
      throw new Error('Redis is not ready')
    }

    return {
      status: 'ok',
      service: 'irib-dwp-backend',
      dependencies: { database: 'ok', redis: 'ok' },
      timestamp: new Date().toISOString(),
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics' })
  @Header('Content-Type', 'text/plain')
  @HttpCode(HttpStatus.OK)
  async metrics() {
    return await this.metricsService.getMetrics()
  }
}
