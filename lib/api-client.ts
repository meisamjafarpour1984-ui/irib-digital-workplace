const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
}

interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params, headers: customHeaders, ...rest } = options

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // Make request
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    })

    // Handle errors
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: `Request failed: ${response.statusText}`,
      }
      try {
        const data = await response.json()
        error.message = data.message || error.message
        error.errors = data.errors
      } catch {
        // Response is not JSON
      }
      throw error
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
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
export type { ApiError, RequestOptions }

// WebSocket Client for Real-time Updates
export class WSClient {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(url: string) {
    this.url = url
  }

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(`${this.url}/ws/inbox?token=${token}`)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data)
        const handlers = this.listeners.get(type)
        handlers?.forEach((handler) => handler(data))
      } catch (e) {
        console.error('WebSocket message parse error:', e)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
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

  subscribe(type: string, handler: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(handler)
    return () => this.listeners.get(type)?.delete(handler)
  }

  send(type: string, data: any) {
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
