const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export class ServerApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function fetchPublicApi<T>(
  path: string,
  options?: { revalidate?: number | false }
): Promise<T | null> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  try {
    const response = await fetch(url, {
      next:
        options?.revalidate === false
          ? { revalidate: 0 }
          : { revalidate: options?.revalidate ?? 60 },
      headers: { Accept: 'application/json' },
    })

    if (response.status === 404) return null
    if (!response.ok) {
      throw new ServerApiError(response.status, `API ${path} failed: ${response.statusText}`)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ServerApiError) throw error
    console.warn(`[fetchPublicApi] ${path}:`, error)
    return null
  }
}
