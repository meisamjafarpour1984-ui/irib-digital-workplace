/**
 * IRIB Digital Workplace Platform - Query Timeout Middleware Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import {
  QueryTimeoutMiddleware,
  withQueryTimeout,
  QueryTimeoutOptions,
} from './query-timeout.middleware'
import { Request, Response, NextFunction } from 'express'

function makeReq(partial: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/api/v1/users/me',
    originalUrl: '/api/v1/users/me',
    ip: '127.0.0.1',
    headers: {},
    ...partial,
  } as unknown as Request
}

function makeRes(partial: Partial<Response> = {}): {
  res: Response
  onSpy: jest.Mock
  statusSpy: jest.Mock
  jsonSpy: jest.Mock
  setHeaderSpy: jest.Mock
  headersSent: boolean
} {
  const headersSent = false
  const onSpy = jest.fn()
  const statusSpy = jest.fn(() => ({ json: jsonSpy })) as any
  const jsonSpy = jest.fn()
  const setHeaderSpy = jest.fn()
  const res = {
    headersSent,
    on: onSpy,
    setHeader: setHeaderSpy,
    status: statusSpy,
    ...partial,
  } as unknown as Response
  return { res, onSpy, statusSpy, jsonSpy, setHeaderSpy, headersSent }
}

describe('QueryTimeoutMiddleware', () => {
  let middleware: QueryTimeoutMiddleware
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    jest.useFakeTimers()
    // Set a tiny timeout for tests
    process.env.QUERY_TIMEOUT_MS = '200'
    process.env.QUERY_HEAVY_READ_TIMEOUT_MS = '150'
    process.env.QUERY_UPLOAD_TIMEOUT_MS = '1000'
    process.env.QUERY_EXPORT_TIMEOUT_MS = '2000'
    middleware = new QueryTimeoutMiddleware()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.useRealTimers()
  })

  describe('bypass rules', () => {
    it('bypasses OPTIONS methods entirely (no abort controller attached)', () => {
      const req = makeReq({ method: 'OPTIONS' })
      const { res, onSpy } = makeRes()
      const next: NextFunction = jest.fn()

      middleware.use(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(onSpy).not.toHaveBeenCalled()
      expect((req as any).abortController).toBeUndefined()
    })

    it('bypasses /health endpoint', () => {
      const req = makeReq({ path: '/health' })
      const { res, onSpy } = makeRes()
      const next: NextFunction = jest.fn()

      middleware.use(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(onSpy).not.toHaveBeenCalled()
    })

    it('bypasses /metrics endpoint', () => {
      const req = makeReq({ path: '/metrics' })
      const { res } = makeRes()
      const next: NextFunction = jest.fn()
      middleware.use(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('bypasses /api/docs path', () => {
      const req = makeReq({ path: '/api/docs/swagger.json' })
      const { res } = makeRes()
      const next: NextFunction = jest.fn()
      middleware.use(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('timeout resolution per route category', () => {
    it('uses export timeout (2000ms) for GET with /export or /pdf', () => {
      const req = makeReq({
        method: 'GET',
        path: '/api/v1/reports/export',
      })
      const timeout = middleware.getTimeoutForPath(req)
      expect(timeout).toBe(2000)
    })

    it('uses export timeout for PDF generation route', () => {
      const req = makeReq({
        method: 'GET',
        path: '/api/v1/pdf/generate/123',
      })
      expect(middleware.getTimeoutForPath(req)).toBe(2000)
    })

    it('uses upload timeout for POST /upload', () => {
      const req = makeReq({
        method: 'POST',
        path: '/api/v1/media/upload',
      })
      expect(middleware.getTimeoutForPath(req)).toBe(1000)
    })

    it('uses heavy read timeout for GET /analytics', () => {
      const req = makeReq({
        method: 'GET',
        path: '/api/v1/analytics/dashboard',
      })
      expect(middleware.getTimeoutForPath(req)).toBe(150)
    })

    it('uses heavy read timeout for GET /audit', () => {
      const req = makeReq({
        method: 'GET',
        path: '/api/v1/audit/logs',
      })
      expect(middleware.getTimeoutForPath(req)).toBe(150)
    })

    it('uses default timeout for regular CRUD routes', () => {
      const req = makeReq({
        method: 'GET',
        path: '/api/v1/users/me',
      })
      expect(middleware.getTimeoutForPath(req)).toBe(200)
    })
  })

  describe('abort behaviour', () => {
    it('attaches abortController and queryTimeoutMs to request object', () => {
      const req = makeReq()
      const { res } = makeRes()
      const next: NextFunction = jest.fn()

      middleware.use(req, res, next)

      expect(next).toHaveBeenCalled()
      expect((req as any).abortController).toBeDefined()
      expect((req as any).queryTimeoutMs).toBe(200)
      expect((req as any).queryTimeoutAt).toBeGreaterThan(Date.now())
    })

    it('responds 408 Request Timeout when timer fires BEFORE finish', () => {
      const req = makeReq({ path: '/api/v1/analytics/slow' })
      const { res, onSpy, statusSpy, jsonSpy, setHeaderSpy } = makeRes()
      const next: NextFunction = jest.fn()

      middleware.use(req, res, next)

      // Simulate Express registering finish/close listeners via res.on
      const [event1Name, finishCb] = onSpy.mock.calls[0] as [string, () => void]
      expect(event1Name).toBe('finish')

      // Do NOT invoke finishCb — let timeout fire
      jest.advanceTimersByTime(1000)

      expect(statusSpy).toHaveBeenCalledWith(408)
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 408,
          error: 'Request Timeout',
        })
      )
      expect(setHeaderSpy).toHaveBeenCalledWith('X-Query-Timeout', '150')
      expect(setHeaderSpy).toHaveBeenCalledWith('Connection', 'close')
    })

    it('aborts the request-level AbortController when timeout fires', () => {
      const req = makeReq()
      const { res, onSpy } = makeRes()
      const next: NextFunction = jest.fn()

      middleware.use(req, res, next)
      expect((req as any).abortController.signal.aborted).toBe(false)

      jest.advanceTimersByTime(500)

      expect((req as any).abortController.signal.aborted).toBe(true)
    })

    it('does NOT double-respond when headers already sent', () => {
      const req = makeReq()
      const { res, statusSpy } = makeRes()
      ;(res as any).headersSent = true
      const next: NextFunction = jest.fn()

      middleware.use(req, res, next)
      jest.advanceTimersByTime(500)

      expect(statusSpy).not.toHaveBeenCalled()
    })
  })

  describe('static helpers', () => {
    it('getStatementTimeoutSQL builds safe SET LOCAL SQL', () => {
      expect(QueryTimeoutMiddleware.getStatementTimeoutSQL(5000)).toBe(
        "SET LOCAL statement_timeout = '5000ms'"
      )
    })

    it('getStatementTimeoutSQL clamps negative values to 500ms minimum', () => {
      expect(QueryTimeoutMiddleware.getStatementTimeoutSQL(-10)).toBe(
        "SET LOCAL statement_timeout = '500ms'"
      )
    })

    it('extractRequestSignal returns undefined when request has no controller', () => {
      const req = makeReq()
      expect(QueryTimeoutMiddleware.extractRequestSignal(req)).toBeUndefined()
    })

    it('extractRequestSignal returns signal when controller attached', () => {
      const req = makeReq()
      const { res } = makeRes()
      middleware.use(req, res, jest.fn())
      const signal = QueryTimeoutMiddleware.extractRequestSignal(req)
      expect(signal).toBeDefined()
      expect((signal as AbortSignal).aborted).toBe(false)
    })
  })
})

describe('withQueryTimeout helper', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('uses existing request abort signal if available', async () => {
    const req = makeReq()
    process.env.QUERY_TIMEOUT_MS = '5000'
    const middleware = new QueryTimeoutMiddleware()
    const { res } = makeRes()
    middleware.use(req, res, jest.fn())

    const signalFromReq = QueryTimeoutMiddleware.extractRequestSignal(req)
    const fn = jest.fn(async (signal?: AbortSignal) => ({ ok: true, signal }))

    const result = await withQueryTimeout(req, 100, fn)
    expect(fn).toHaveBeenCalledWith(signalFromReq)
    expect(result).toEqual({ ok: true, signal: signalFromReq })
  })

  it('creates a new AbortController + timeout when request has none', async () => {
    const req = makeReq()
    const fn = jest.fn(async (signal?: AbortSignal) => {
      expect(signal).toBeDefined()
      return 'done'
    })

    const result = await withQueryTimeout(req, 1000, fn)
    expect(result).toBe('done')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('clears timeout after function resolution (no leak)', async () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout')
    const req = makeReq()
    await withQueryTimeout(req, 10_000, async () => 'fast')
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
