import { apiClient } from '@/lib/api-client'
import type { ContentType } from '@/lib/services/content'

export interface SearchResult {
  id: string
  slug: string
  contentType: ContentType
  title: string | { fa?: string }
  excerpt: string | { fa?: string } | null
  publishedAt: string | null
  rank: number
}

export const searchApi = {
  search: (q: string, type?: ContentType, limit = 20) =>
    apiClient.get<{ results: SearchResult[]; total: number }>('/search', {
      params: { q, type, limit },
    }),
}
