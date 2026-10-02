import { NextRequest, NextResponse } from 'next/server'
import { backendApiUrl, forwardBackendHeaders } from '@/lib/server/backend-request'

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    const url = new URL(backendApiUrl(`/admin/settings/${key}/history`))

    const response = await fetch(url.toString(), {
      headers: forwardBackendHeaders(request),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch setting history')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching setting history:', error)
    return NextResponse.json({ error: 'Failed to fetch setting history' }, { status: 500 })
  }
}
