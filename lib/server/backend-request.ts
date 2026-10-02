import type { NextRequest } from 'next/server'

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const apiOrigin = configuredApiUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '')

export const backendApiUrl = (path: string) =>
  `${apiOrigin}/api/v1${path.startsWith('/') ? path : `/${path}`}`

export function forwardBackendHeaders(request: NextRequest, contentType = true) {
  const headers = new Headers()
  if (contentType) headers.set('Content-Type', 'application/json')

  const authorization = request.headers.get('authorization')
  const cookie = request.headers.get('cookie')
  if (authorization) headers.set('Authorization', authorization)
  if (cookie) headers.set('Cookie', cookie)

  return headers
}
