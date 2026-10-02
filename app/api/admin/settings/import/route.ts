import { NextRequest, NextResponse } from 'next/server'
import { backendApiUrl, forwardBackendHeaders } from '@/lib/server/backend-request'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(backendApiUrl('/admin/settings/import'))

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: forwardBackendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to import settings')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error importing settings:', error)
    return NextResponse.json({ error: 'Failed to import settings' }, { status: 500 })
  }
}
