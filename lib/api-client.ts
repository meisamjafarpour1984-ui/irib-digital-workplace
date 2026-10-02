/**
 * Handles API errors with consistent logging and reporting
 * @param error The error to handle
 * @param context Context information for the error
 */
function handleApiError(error: unknown, context: string = 'API'): Error {
  console.error(`[${context}] Error:`, error)

  // Error reporting to monitoring system (placeholder for Sentry/LogRocket integration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Sentry.captureException(error, {
      tags: { context },
      extra: { type: context },
    })
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(`Unknown ${context} error`)
}

/**
 * Returns user-friendly error message in Persian/English
 * @param error The error to translate
 * @returns User-friendly error message
 */
function getUserFriendlyErrorMessage(error: Error): string {
  const errorMessages: Record<string, { fa: string; en: string }> = {
    'Network Error': {
      fa: 'خطای اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
      en: 'Network error. Please check your internet connection.',
    },
    'Request failed': {
      fa: 'خطا در درخواست به سرور. لطفاً دوباره تلاش کنید.',
      en: 'Failed to communicate with server. Please try again.',
    },
    Unauthorized: {
      fa: 'لطفاً وارد شوید.',
      en: 'Please log in.',
    },
    Forbidden: {
      fa: 'شما دسترسی به این بخش را ندارید.',
      en: 'You do not have permission to access this section.',
    },
    'Not Found': {
      fa: 'منبع مورد نظر یافت نشد.',
      en: 'The requested resource was not found.',
    },
    'Internal Server Error': {
      fa: 'خطای سرور. لطفاً بعداً تلاش کنید.',
      en: 'Server error. Please try again later.',
    },
  }

  // Try to match error message
  for (const [key, messages] of Object.entries(errorMessages)) {
    if (error.message.includes(key)) {
      return messages.fa // Default to Persian
    }
  }

  // Default fallback
  return error.message
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
  responseType?: 'json' | 'blob'
  suppress404Error?: boolean // Suppress error throwing for 404 responses
}

class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private refreshPromise: Promise<string | null> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
    // Access tokens are intentionally memory-only; refresh uses an HttpOnly cookie.
    if (typeof window !== 'undefined') localStorage.removeItem('accessToken')
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryAfterRefresh = true
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      params,
      timeout = 10000,
      responseType = 'json',
      headers: customHeaders,
      ...rest
    } = options

    // Build URL with params
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
      const qs = searchParams.toString()
      if (qs) url += `?${qs}`
    }

    // Build headers
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(customHeaders as Record<string, string>),
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let response: Response | undefined
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await Promise.race([
          fetch(url, {
            method,
            headers,
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            credentials: 'include',
            ...rest,
          }),
          new Promise<Response>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          }),
        ])
        break
      } catch (error) {
        lastError = error
        if (attempt === 2) throw handleApiError(error, 'API request')
      }
    }

    if (!response) throw handleApiError(lastError, 'API request')

    // Handle errors
    if (response.status === 401 && retryAfterRefresh && endpoint !== '/auth/refresh') {
      const refreshedToken = await this.refreshAccessToken()
      if (refreshedToken) {
        return this.request<T>(endpoint, options, false)
      }
    }

    if (!response.ok) {
      // Suppress error for 404 if requested (for optional features not yet implemented)
      if (response.status === 404 && options?.suppress404Error) {
        return undefined as T
      }

      let message = `Request failed: ${response.statusText}`
      let errors: Record<string, string[]> | undefined
      try {
        const data = await response.json()
        message = Array.isArray(data.message)
          ? data.message.join('، ')
          : data.message || data.error || message
        errors = data.errors
      } catch {
        // Response is not JSON
      }
      const userFriendlyMessage = getUserFriendlyErrorMessage(new Error(message))
      throw new ApiError(response.status, `${message}: ${userFriendlyMessage}`, errors)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return (responseType === 'blob' ? response.blob() : response.json()) as Promise<T>
  }

  private refreshAccessToken() {
    if (!this.refreshPromise) {
      this.refreshPromise = fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(async (response) => {
          if (!response.ok) return null
          const session = (await response.json()) as { accessToken?: string }
          this.setToken(session.accessToken ?? null)
          return session.accessToken ?? null
        })
        .finally(() => {
          this.refreshPromise = null
        })
    }
    return this.refreshPromise
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE)
export { ApiClient, ApiClient as APIClient, ApiError, getUserFriendlyErrorMessage }
export type { RequestOptions }

// WebSocket Client for Real-time Updates
export interface WSMessage {
  type: string
  payload?: unknown
  [key: string]: unknown
}

export class WSClient {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, Set<(data: WSMessage) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(url: string) {
    this.url = url
  }

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(`${this.url}/ws/inbox?token=${token}`)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data)
        const handlers = this.listeners.get(type)
        handlers?.forEach((handler) => handler(data))
      } catch (e) {
        throw handleApiError(e, 'WebSocket')
      }
    }

    this.ws.onclose = () => {
      this.attemptReconnect(token)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    setTimeout(() => this.connect(token), Math.pow(2, this.reconnectAttempts) * 1000)
  }

  subscribe(type: string, handler: (data: WSMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(handler)
    return () => this.listeners.get(type)?.delete(handler)
  }

  send(type: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

export const wsClient = new WSClient(WS_BASE)
