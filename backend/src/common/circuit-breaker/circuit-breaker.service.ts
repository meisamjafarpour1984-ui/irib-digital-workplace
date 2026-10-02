/**
 * IRIB Digital Workplace Platform - Circuit Breaker Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number // Number of failures before opening
  resetTimeout: number // Time in milliseconds before attempting reset
  monitoringPeriod?: number // Time window for counting failures
}

export interface CircuitBreakerStats {
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureTime?: number
  lastSuccessTime?: number
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name)
  private readonly circuits = new Map<string, CircuitBreaker>()

  register(name: string, options: CircuitBreakerOptions): CircuitBreaker {
    if (this.circuits.has(name)) {
      return this.circuits.get(name)!
    }

    const circuit = new CircuitBreaker(name, options, this.logger)
    this.circuits.set(name, circuit)
    return circuit
  }

  get(name: string): CircuitBreaker | undefined {
    return this.circuits.get(name)
  }

  getStats(name: string): CircuitBreakerStats | undefined {
    const circuit = this.circuits.get(name)
    return circuit?.getStats()
  }

  reset(name: string): void {
    const circuit = this.circuits.get(name)
    circuit?.reset()
  }
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastFailureTime?: number
  private lastSuccessTime?: number
  private failuresInWindow: number[] = []

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions,
    private readonly logger: Logger
  ) {}

  async execute<T>(fn: () => Promise<T> | T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
        this.logger.log(`Circuit ${this.name} transitioning to HALF_OPEN`)
      } else {
        throw new Error(`Circuit ${this.name} is OPEN`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.successCount++
    this.lastSuccessTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED
      this.failureCount = 0
      this.failuresInWindow = []
      this.logger.log(`Circuit ${this.name} transitioning to CLOSED`)
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    const now = Date.now()
    const window = this.options.monitoringPeriod || 60000 // Default 1 minute

    // Track failures in the monitoring window
    this.failuresInWindow.push(now)
    this.failuresInWindow = this.failuresInWindow.filter((time) => now - time < window)

    if (this.failuresInWindow.length >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN
      this.logger.warn(
        `Circuit ${this.name} transitioning to OPEN (failures: ${this.failuresInWindow.length})`
      )
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false
    return Date.now() - this.lastFailureTime > this.options.resetTimeout
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = undefined
    this.lastSuccessTime = undefined
    this.failuresInWindow = []
    this.logger.log(`Circuit ${this.name} reset to CLOSED`)
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
    }
  }
}

// Decorator for circuit breaker
export function UseCircuitBreaker(name: string, options: CircuitBreakerOptions) {
  return function (_target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      this: { circuitBreakerService?: CircuitBreakerService },
      ...args: unknown[]
    ) {
      const circuitBreakerService = this.circuitBreakerService
      if (!circuitBreakerService) {
        return originalMethod.apply(this, args)
      }

      const circuit = circuitBreakerService.register(name, options)
      return circuit.execute(() => originalMethod.apply(this, args))
    }

    return descriptor
  }
}
