import { NextRequest, NextResponse } from 'next/server'
import { backendApiUrl, forwardBackendHeaders } from '@/lib/server/backend-request'

export async function POST(_request: NextRequest) {
  try {
    const url = new URL(backendApiUrl('/admin/settings/initialize'))

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: forwardBackendHeaders(_request),
    })

    if (!response.ok) {
      throw new Error('Failed to initialize settings')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error initializing settings:', error)
    return NextResponse.json({ error: 'Failed to initialize settings' }, { status: 500 })
  }
}
