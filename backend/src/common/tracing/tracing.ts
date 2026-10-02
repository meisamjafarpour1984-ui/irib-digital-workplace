import { Logger } from '@nestjs/common'

const OTEL_ENABLED = process.env.OTEL_ENABLED === 'true'
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'irib-dwp-backend'
const OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'

const logger = new Logger('OpenTelemetry')

let nodeSDK: any = null

export async function initTracing() {
  if (!OTEL_ENABLED) {
    logger.log('OpenTelemetry tracing disabled (set OTEL_ENABLED=true to enable)')
    return
  }

  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node')
    const { getNodeAutoInstrumentations } =
      await import('@opentelemetry/auto-instrumentations-node')
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
    const { ConsoleSpanExporter } = await import('@opentelemetry/sdk-trace-base')
    const { Resource } = await import('@opentelemetry/resources')
    const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions')
    const { CompositePropagator, W3CTraceContextPropagator, W3CBaggagePropagator } =
      await import('@opentelemetry/core')

    const exporters = []

    if (process.env.OTEL_CONSOLE_EXPORTER === 'true') {
      exporters.push(new ConsoleSpanExporter())
    }

    try {
      const otlpExporter = new OTLPTraceExporter({
        url: OTEL_EXPORTER_OTLP_ENDPOINT,
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
          ? Object.fromEntries(
              process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',').map((pair) => {
                const [k, v] = pair.split('=')
                return [k.trim(), v?.trim() || '']
              })
            )
          : {},
      })
      exporters.push(otlpExporter)
      logger.log(`OTLP exporter configured → ${OTEL_EXPORTER_OTLP_ENDPOINT}`)
    } catch (e: any) {
      logger.warn(`OTLP exporter could not be initialised: ${e.message}`)
    }

    if (exporters.length === 0) {
      exporters.push(new ConsoleSpanExporter())
    }

    nodeSDK = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: OTEL_SERVICE_NAME,
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'irib-east-azerbaijan',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      }),
      traceExporter: exporters[0],
      textMapPropagator: new CompositePropagator({
        propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
          '@opentelemetry/instrumentation-http': { enabled: true },
          '@opentelemetry/instrumentation-pg': { enabled: true },
          '@opentelemetry/instrumentation-pino': { enabled: true },
          '@opentelemetry/instrumentation-ioredis': { enabled: true },
        }),
      ],
    })

    await nodeSDK.start()

    logger.log(
      `OpenTelemetry initialised (service=${OTEL_SERVICE_NAME}, env=${process.env.NODE_ENV})`
    )
  } catch (error: any) {
    logger.error(`OpenTelemetry initialisation failed: ${error.message}`, error.stack)
    logger.warn('Application will continue WITHOUT distributed tracing')
  }
}

export async function shutdownTracing() {
  if (!nodeSDK) return
  try {
    await nodeSDK.shutdown()
    logger.log('OpenTelemetry flushed and shutdown gracefully')
  } catch (e: any) {
    logger.error(`OpenTelemetry shutdown error: ${e.message}`)
  }
}

/**
 * Lightweight helper — decorates a promise / async function with a child span.
 * Falls back to no-op when OpenTelemetry SDK is not present.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: any) => Promise<T> | T,
  attrs: Record<string, any> = {}
): Promise<T> {
  if (!nodeSDK) {
    return fn(null)
  }

  try {
    const api = await import('@opentelemetry/api')
    const tracer = api.trace.getTracer(OTEL_SERVICE_NAME)
    return tracer.startActiveSpan(name, { attributes: attrs }, async (span) => {
      try {
        const result = await fn(span)
        span.setStatus({ code: api.SpanStatusCode.OK })
        return result
      } catch (error: any) {
        span.setStatus({
          code: api.SpanStatusCode.ERROR,
          message: error?.message || String(error),
        })
        span.recordException(error)
        throw error
      } finally {
        span.end()
      }
    })
  } catch {
    return fn(null)
  }
}
