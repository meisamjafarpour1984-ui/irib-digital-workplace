import { Injectable, OnModuleInit } from '@nestjs/common'
import { Counter, Histogram, Registry, Gauge } from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
  private register!: Registry

  // HTTP metrics
  private httpRequestsTotal!: Counter<string>
  private httpRequestDuration!: Histogram<string>

  // Database metrics
  private dbConnections!: Gauge<string>
  private dbQueryDuration!: Histogram<string>

  // Cache metrics
  private cacheHits!: Counter<string>
  private cacheMisses!: Counter<string>

  onModuleInit() {
    this.register = new Registry()

    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status', 'route'],
      registers: [this.register],
    })

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    })

    // Database metrics
    this.dbConnections = new Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      registers: [this.register],
    })

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    })

    // Cache metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      registers: [this.register],
    })

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      registers: [this.register],
    })
  }

  getMetrics(): Promise<string> {
    return this.register.metrics()
  }

  // HTTP methods
  incrementHttpRequest(method: string, status: string, route: string) {
    this.httpRequestsTotal.inc({ method, status, route })
  }

  observeHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration)
  }

  // Database methods
  setDbConnections(count: number) {
    this.dbConnections.set(count)
  }

  observeDbQuery(operation: string, duration: number) {
    this.dbQueryDuration.observe({ operation }, duration)
  }

  // Cache methods
  incrementCacheHit() {
    this.cacheHits.inc()
  }

  incrementCacheMiss() {
    this.cacheMisses.inc()
  }
}
