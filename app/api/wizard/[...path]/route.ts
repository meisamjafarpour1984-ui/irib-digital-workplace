import { NextRequest, NextResponse } from 'next/server'
import { backendApiUrl, forwardBackendHeaders } from '@/lib/server/backend-request'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join('/')
    const url = `${backendApiUrl(`/admin/wizard/${path}`)}${request.nextUrl.search}`

    const response = await fetch(url, {
      method: 'GET',
      headers: forwardBackendHeaders(request),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join('/')
    const url = backendApiUrl(`/admin/wizard/${path}`)

    const body = await request.json()
    const response = await fetch(url, {
      method: 'POST',
      headers: forwardBackendHeaders(request),
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: String(error) },
      { status: 500 }
    )
  }
}
