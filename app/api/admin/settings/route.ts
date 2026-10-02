import { NextRequest, NextResponse } from 'next/server'
import { backendApiUrl, forwardBackendHeaders } from '@/lib/server/backend-request'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isPublic = searchParams.get('isPublic')

    const url = new URL(backendApiUrl('/admin/settings'))
    if (category) url.searchParams.append('category', category)
    if (isPublic) url.searchParams.append('isPublic', isPublic)

    const response = await fetch(url.toString(), {
      headers: forwardBackendHeaders(request),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch settings')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(backendApiUrl('/admin/settings'))

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: forwardBackendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to update setting')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
